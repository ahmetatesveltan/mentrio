
from flask import Flask, render_template, request, jsonify, session, redirect
from main import *
import main
from flask import request
import json
from datetime import *

app = Flask(__name__)
app.secret_key = "Secret key"

users = ["Ates", "İbisoglu"]

@app.route("/")
def home():
    user = session.get("user")


    if user is None:
        return render_template("index.html", giris_yapildi=False)

    data = load_data(user)

    calisilacak_konular = bugun_calisilacaklar(data) #Çalışılacak 2 konu
                                                      #2konunun ustalığı
    calisilacak_ustaliklar = []
    for ders, konu in calisilacak_konular:
        ustalik = ustalik_hesapla(data, ders, konu)
        calisilacak_ustaliklar.append(ustalik)
    return render_template("index.html",
                           calisilacak_konular = calisilacak_konular,
                           calisilacak_ustaliklar = calisilacak_ustaliklar,
                           giris_yapildi = True,
                           user = user)

@app.route("/ders/<ders_adi>")  #DERS SAYFASINI AÇAR
def ders_sayfasi(ders_adi):
    user = session.get("user")
    data = load_data(user)
    secilen_ders = ders_adi.capitalize()
    konu_butonlari = [konu for konu in data["Dersler"][secilen_ders.capitalize()].keys()]
    basari_zayif_konular = konu_basari_siralama(user, secilen_ders)[:5]
    calisma_zayif_konular = konu_calisma_sure_siralama(user, secilen_ders)[:5]
    print(calisma_zayif_konular)
    return render_template("ders.html",
                    secilen_ders=secilen_ders.capitalize(),
                    ders_konulari = konu_butonlari,
                    basari_zayif_konular = basari_zayif_konular,
                    calisma_zayif_konular = calisma_zayif_konular)

@app.route("/ders/<ders_adi>/konu/<konu_adi>") #KONU SAYFASINI AÇAR
def konu_sayfasi(ders_adi, konu_adi):
    user = session.get("user")
    data = load_data(user)
    secilen_ders = ders_adi
    secilen_konu = konu_adi
    dogru_bilgisi = data["Dersler"][secilen_ders.capitalize()][secilen_konu.capitalize()]["dogru"]
    yanlis_bilgisi = data["Dersler"][secilen_ders.capitalize()][secilen_konu.capitalize()]["yanlis"]
    try:
        yuzde_bilgisi = round(100*dogru_bilgisi/(yanlis_bilgisi+dogru_bilgisi),2)
    except ZeroDivisionError:
        yuzde_bilgisi = 0

    return render_template("konu.html",
                           ders= secilen_ders.capitalize(),
                           konu=secilen_konu.capitalize(),
                           dogru_bilgisi = dogru_bilgisi,
                           yanlis_bilgisi = yanlis_bilgisi,
                           yuzde_bilgisi = yuzde_bilgisi)

@app.route("/api/login", methods=["POST"])
def login_page():
    veri = request.json
    user = veri["user"].capitalize()
    if user in users:
        session["user"] = user
        giris_basarisi = True
    else:
        giris_basarisi = False
    return jsonify({"giris_basarisi": giris_basarisi,
                    "kullanici": user})

@app.route("/api/logout")
def logout():

    session.pop("user", None)
    return redirect("/")


@app.route("/api/ys-select") #KONU SELECTINI DOLDURUR
def ys_konu_select():
    user = session.get("user")
    data = load_data(user)

    ders = request.args.get("ders")
    ys_select_konular = list(data["Dersler"][ders.capitalize()].keys())
    return ys_select_konular

@app.route("/api/ys-ekle", methods=["POST"]) #YANLIŞ YAPILAN SORULARI VERİTABANINA EKLER
def ys_ekle():
    user = session.get("user")
    secilenDers = request.form["ders"]
    secilenKonu = request.form["konu"]
    secilenCevap = request.form["cevap"]
    secilenGorsel = request.files["image"]
    soru_havuzuna_ekle(user, secilenDers.capitalize(), secilenKonu.capitalize(), secilenCevap, secilenGorsel)
    return "Cevaplar JSON'a Kaydedildi"

@app.route("/api/cozulecek-sorular") #BUGÜN ÇÖZÜLECEK SORULARI VERİR
def cozulecek_sorular():
    user = session.get("user")
    data = load_data(user)
    liste = soru_havuzu_tekrar(data)
    idler = []
    for soru in liste:
        idler.append(soru[0])
    bilgiler = []
    for id in idler:
        bugun = str(date.today())
        bilgi = {}
        bilgi["id"] = id
        for k,v in data["Soru Havuzu"][id].items():
            if bugun in data["Gunluk Cozulen Sorular"]:
                bilgi["bugun_cozuldu"] = id in data["Gunluk Cozulen Sorular"][bugun]
            else:
                bilgi["bugun_cozuldu"] = False

            bilgi[k] = v
        bilgiler.append(bilgi)

    return jsonify(bilgiler)

@app.route("/api/cozulecek-sorular-kontrol", methods=["POST"]) #ÇÖZÜLEN SORULARIN DOĞRULUĞUNU 
def cozulecek_sorular_kontrol():                                   #KONTROL EDER
    user = session.get("user")
    data = load_data(user)
    bugun = str(date.today())
    if bugun not in data["Gunluk Cozulen Sorular"]:
        data["Gunluk Cozulen Sorular"][bugun] = []
    veri = request.json
    cevap = veri["cevap"]
    id = veri["soru_id"]
    data["Gunluk Cozulen Sorular"][bugun].append(id)
    dogru_cevap = data["Soru Havuzu"][id]["Cevap"]
    dogruluk = soru_havuzu_cozme(data, id, cevap)

    save_data(user, data)

    return jsonify({"dogruluk": dogruluk, "dogru_cevap": dogru_cevap})

@app.route("/api/konu-ekle", methods=["POST"]) #DERS SAYFASINA KONU BUTONLARI KOYAR 
def sayfaya_konu_ekle():
    user = session.get("user")
    veri = request.json
    ders = veri["ders"].capitalize()
    konu = veri["konu"]

    konu_ekle(user, ders, konu)

    return jsonify({
        "basarili": True
    })

@app.route("/api/soru-yuklemesi", methods=["POST"])
def soru_yuklemesi():
    user = session.get("user")
    data = load_data(user)
    veri = request.json

    dogru_sayisi = int(veri["dogru_sayisi"])
    yanlis_sayisi = int(veri["yanlis_sayisi"])
    ders = veri["ders"]
    konu = veri["konu"]

    data["Dersler"][ders][konu]["dogru"] += dogru_sayisi
    data["Dersler"][ders][konu]["yanlis"] += yanlis_sayisi


    save_data(user, data)

    return jsonify({
        "basarili": True
    })

if __name__ == "__main__":
    app.run(debug=True)