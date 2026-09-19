from typing import Protocol
from flask import Flask, render_template, request, jsonify, session, redirect
from main import *
import main
import mysql.connector
from flask import request
from datetime import *

app = Flask(__name__)
app.secret_key = "Secret key"



@app.route("/")
def home():
    user = session.get("user")

    user_id = username_to_userid(user)
    connection = get_connection()

    cursor = connection.cursor()

    if user is None:
        return render_template("index.html", giris_yapildi=False)



    calisilacak_konular = bugun_calisilacaklar(user) #Çalışılacak 2 konu
    calisilacak_konu_bilgileri = {}
    for konu in calisilacak_konular:
        cursor.execute(
            """
                SELECT subject_id FROM topics WHERE user_id = %s AND name = %s
            """,
            (user_id, konu.capitalize())
        )
        subject_id = cursor.fetchone()[0]
        cursor.execute(
            """
                SELECT name FROM subjects WHERE id = %s
            """,
            (subject_id,)
        )
        ders = cursor.fetchone()[0]

        calisilacak_konu_bilgileri[konu] = ders

    calisilacak_ustaliklar = []
    for konu in calisilacak_konular:
        ustalik = ustalik_hesapla(user, konu)
        calisilacak_ustaliklar.append(ustalik)
    return render_template("index.html",
                           calisilacak_konu_bilgileri = calisilacak_konu_bilgileri,
                           calisilacak_ustaliklar = calisilacak_ustaliklar,
                           giris_yapildi = True,
                           user = user)

@app.route("/ders/<ders_adi>")  #DERS SAYFASINI AÇAR
def ders_sayfasi(ders_adi):
    user = session.get("user")
    user_id = username_to_userid(user)
    connection = get_connection()

    cursor = connection.cursor()

    secilen_ders = ders_adi.capitalize()

    cursor.execute(
        """
            SELECT id FROM subjects WHERE name =%s
        """,
        (secilen_ders,)
    )
    subject_id = cursor.fetchone()[0]

    cursor.execute(
        """
            SELECT name FROM topics WHERE user_id = %s AND subject_id = %s
        """,
        (user_id, subject_id)
    )

    konular = cursor.fetchall()
    konu_butonlari = []
    for konu_tuple in konular:
        konu = str(konu_tuple[0]) #Fetchall tuple döndürüyor. Sadece konu ismi alındı.
        konu_butonlari.append(konu)
    basari_zayif_konular = konu_basari_siralama(user, secilen_ders)

    calisma_zayif_konular = konu_calisma_sure_siralama(user, secilen_ders)
    calisma_zayif_konular_return = []
    for konu, sure in calisma_zayif_konular:
        min_tarih = datetime.strptime("2000-01-01", "%Y-%m-%d").date()
        gecen_gun = str((date.today() - min_tarih).days)

        if gecen_gun == str(sure):
            calisma_zayif_konular_return.append((konu, "Henüz Çalışılmadı."))
        else:
            calisma_zayif_konular_return.append((konu, f"{sure} Gün"))


    return render_template("ders.html",
                    secilen_ders=secilen_ders.capitalize(),
                    ders_konulari = konu_butonlari,
                    basari_zayif_konular = basari_zayif_konular,
                    calisma_zayif_konular = calisma_zayif_konular_return)


@app.route("/ders/<ders_adi>/konu/<konu_adi>")  # KONU SAYFASINI AÇAR
def konu_sayfasi(ders_adi, konu_adi):
    user = session.get("user")
    user_id = username_to_userid(user)
    connection = get_connection()

    cursor = connection.cursor()

    secilen_ders = ders_adi.capitalize()
    secilen_konu = konu_adi.capitalize()



    ustalik = ustalik_hesapla(user, secilen_konu)
    rank = ustalik_rank(user, secilen_konu)
    sayac = soru_havuzu_sayac(user, secilen_konu)

    cursor.execute(
        """
            SELECT correct_answer, wrong_answer 
            FROM topics 
            WHERE name = %s AND user_id = %s
        """,
        (secilen_konu, user_id)
    ),
    dogru_bilgisi, yanlis_bilgisi = cursor.fetchone()


    konu_calisilmayan_gun = konu_calisilmayan_gun_hesaplama(user, secilen_konu)

    try:
        yuzde_bilgisi = round(
            100 * dogru_bilgisi / (yanlis_bilgisi + dogru_bilgisi),
            2
        )
    except ZeroDivisionError:
        yuzde_bilgisi = 0

    return render_template(
        "konu.html",
        ders=secilen_ders.capitalize(),
        konu=secilen_konu.capitalize(),
        dogru_bilgisi=dogru_bilgisi,
        yanlis_bilgisi=yanlis_bilgisi,
        yuzde_bilgisi=yuzde_bilgisi,
        konu_calisilmayan_gun=konu_calisilmayan_gun,
        ustalik = ustalik,
        ustalik_rank = rank,
        soru_sayaci = sayac
    )


@app.route("/api/login", methods=["POST"])
def login_page():

    connection = get_connection()

    cursor = connection.cursor()

    veri = request.json
    username = veri["user"]
    password = veri["password"]

    login_basarisi= login(username, password)


    if login_basarisi == "logging_in":
        session["user"] = username
        giris_basarisi = "giris_yapildi"
    else:
        if login_basarisi == "user_not_found":
            giris_basarisi = "kullanici_bulunamadi"
        elif login_basarisi == "wrong_password":
            giris_basarisi = "yanlis_sifre"

    return jsonify({"giris_basarisi": giris_basarisi,
                    "kullanici": username})


@app.route("/api/register", methods=["POST"])
def register_page():
    connection = get_connection()

    cursor = connection.cursor()

    veri = request.json
    username = veri["username"]
    password = veri["password"]

    cursor.execute(
        """
            SELECT EXISTS(
                SELECT 1
                FROM users
                WHERE username = %s
            )
        """,
        (username,)
    )
    if not username.strip():
        kayit_basarisi = "bos_username"
    elif cursor.fetchone()[0] == 0:
        kayit_basarisi = "basarili"
        register(username, password)
    else:
        kayit_basarisi = "basarisiz"

    return jsonify({"kayit_basarisi": kayit_basarisi})

@app.route("/api/logout")
def logout():

    session.pop("user", None)
    return redirect("/")


@app.route("/api/ys-select") #KONU SELECTINI DOLDURUR
def ys_konu_select():
    user = session.get("user")
    user_id = username_to_userid(user)
    connection = get_connection()

    cursor = connection.cursor()

    ders = request.args.get("ders")

    cursor.execute(
        """
            SELECT id FROM subjects WHERE name =%s
        """,
        (ders,)
    )
    subject_id = cursor.fetchone()[0]

    cursor.execute(
        """
            SELECT name FROM topics WHERE user_id = %s AND subject_id = %s
        """,
        (user_id, subject_id)
    )
    konular = cursor.fetchall()
    ys_select_konular = []
    for konu in konular:
        ys_select_konular.append(str(konu[0]))


    return ys_select_konular

@app.route("/api/ys-ekle", methods=["POST"]) #YANLIŞ YAPILAN SORULARI VERİTABANINA EKLER
def ys_ekle():
    user = session.get("user")
    user_id = username_to_userid(user)
    connection = get_connection()

    cursor = connection.cursor()

    secilenDers = request.form["ders"]
    secilenKonu = request.form["konu"]
    secilenCevap = request.form["cevap"]
    secilenGorsel = request.files["image"]
    cikti = soru_havuzuna_ekle(user,secilenKonu.capitalize(), secilenCevap, secilenGorsel)
    gorsel_ismi = cikti["gorsel_dosya_ismi"]

    path = os.path.join("static", "questions", gorsel_ismi)
    secilenGorsel.save(path)


    return "Cevaplar JSON'a Kaydedildi"

@app.route("/api/cozulecek-sorular") #BUGÜN ÇÖZÜLECEK SORULARI VERİR
def cozulecek_sorular():
    user = session.get("user")
    user_id = username_to_userid(user)
    connection = get_connection()

    cursor = connection.cursor()

    liste = soru_havuzu_tekrar(user)

    bilgiler = []
    for id in liste:
        bugun = str(date.today())
        bilgi = {}
        bilgi["id"] = id

        cursor.execute(
            """
                SELECT solved_date
                FROM solved_questions
                WHERE user_id =%s
                    AND question_id = %s
                ORDER BY solved_date DESC
                LIMIT 1
                    
            """,
            (user_id, id)
        )
        son_cozme_tarihi = cursor.fetchone()[0]

        cursor.execute(
            """
                SELECT photo
                FROM questions
                WHERE user_id =%s
                AND question_id = %s
                LIMIT 1

            """,
            (user_id, id)
        )
        soru_gorsel_adi = cursor.fetchone()[0]
        bilgi["gorsel_adi"] = soru_gorsel_adi
        if son_cozme_tarihi == bugun:
            bilgi["bugun_cozuldu"] = True
        else:
            bilgi["bugun_cozuldu"] = False

        bilgiler.append(bilgi)

    return jsonify(bilgiler)

@app.route("/api/cozulecek-sorular-kontrol", methods=["POST"]) #ÇÖZÜLEN SORULARIN DOĞRULUĞUNU 
def cozulecek_sorular_kontrol():                                   #KONTROL EDER
    user = session.get("user")

    user_id = username_to_userid(user)
    connection = get_connection()

    cursor = connection.cursor()


    veri = request.json
    cevap = veri["cevap"]
    id = veri["soru_id"]

    cursor.execute(
        """
            SELECT answer
            FROM questions
            WHERE user_id = %s
                AND question_id = %s
        """,
        (user_id, id)
    )

    dogru_cevap = cursor.fetchone()[0]
    dogruluk = soru_havuzu_cozme(user, id, cevap)


    return jsonify({"dogruluk": dogruluk, "dogru_cevap": dogru_cevap})

@app.route("/api/konu-ekle", methods=["POST"]) #DERS SAYFASINA KONU BUTONLARI KOYAR 
def sayfaya_konu_ekle():
    user = session.get("user")
    veri = request.json
    ders = veri["ders"].capitalize()
    konu = veri["konu"].capitalize()

    konu_ekle(user, ders, konu)

    return jsonify({
        "basarili": True
    })

@app.route("/api/soru-yuklemesi", methods=["POST"])
def soru_yuklemesi():
    user = session.get("user")

    veri = request.json

    dogru_sayisi = int(veri["dogru_sayisi"])
    yanlis_sayisi = int(veri["yanlis_sayisi"])
    ders = veri["ders"]
    konu = veri["konu"]

    soru_ekle(user, konu, dogru_sayisi, yanlis_sayisi)

    return jsonify({
        "basarili": True
    })

@app.route("/api/konu-calisildi", methods=["POST"])
def konu_calisildi():
    user = session.get("user")

    veri = request.json
    ders = veri["ders"]
    konu = veri["konu"]

    konu_tekrari(user, konu)

    return jsonify({"basarili": True})

if __name__ == "__main__":
    app.run(debug=True)