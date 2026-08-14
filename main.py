import json
from datetime import *
import os

def load_data(user):
    try:
        with open(f"data/{user}.json", "r", encoding="utf-8") as f:
            return json.load(f)

    except json.JSONDecodeError:
        print("JSON dosyası boş veya bozuk!")
        return None

def save_data(user, data):
    temp_path = f"data/{user}_temp.json"
    user_path = f"data/{user}.json"

    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    os.replace(temp_path, user_path)


#DERS EKLEME
def ders_ekle(user, ders):
    data = load_data(user)
    if ders not in data["Dersler"]:
            data["Dersler"][ders] = {}

    save_data(user, data)
def ders_listesi(user):
    data = load_data(user)
    dersler = []
    for ders in data["Dersler"]:
        dersler.append(ders)
    return dersler
def konu_listesi(user, ders):
    data = load_data(user)
    konular = []
    for konu in data["Dersler"][ders].keys():
        konular.append(konu)
    return konular


#KONU EKLEME
def konu_ekle(user, ders, konu):
    data = load_data(user)


    if konu not in data["Dersler"][ders]:
        data["Dersler"][ders][konu.capitalize()] = {
            "dogru": 0,
            "yanlis": 0,
            "son_tekrar":  "2000-01-01"
        }
    save_data(user, data)

#SORU EKLEME
def soru_ekle(user, ders, konu, dogru, yanlis):
    data = load_data(user)
    #DOĞRU VE YANLIŞ SAYISI EKLEME
    try:
        data["Dersler"][ders][konu]["dogru"] += dogru
        data["Dersler"][ders][konu]["yanlis"] += yanlis
    except KeyError:
        print("Bu ders veya konu programa henüz ekli değil. Lütfen önce sisteme ekleyin.")


    save_data(user, data)


#SON KONU TEKRAR TARİHİ EKLEME
def konu_tekrari(user, ders, konu):
    data = load_data(user)
    data["Dersler"][ders][konu]["son_tekrar"] = str(date.today())

    save_data(user, data)

#USTALIK HESAPLAMA

def ustalik_hesapla(data, ders, konu):
    #SORU YÜZDESİ VE KONU TEKRAR SÜRESİ HESAPLAMA, USTALIK BULMA
    try:
        toplam_soru_sayisi = data["Dersler"][ders][konu]["dogru"] + data["Dersler"][ders][konu]["yanlis"]
        soru_yuzdesi = data["Dersler"][ders][konu]["dogru"]/ toplam_soru_sayisi
        soru_basarisi = (toplam_soru_sayisi/(toplam_soru_sayisi+50) * soru_yuzdesi)
    except ZeroDivisionError:
        soru_basarisi = 0


    son_tekrar_gecici = data["Dersler"][ders][konu]["son_tekrar"]
    son_tekrar_tarihi = datetime.strptime(son_tekrar_gecici,"%Y-%m-%d" ).date()
    tekrar_edilmeyen_gun = date.today() - son_tekrar_tarihi

    if tekrar_edilmeyen_gun.days >= 90:
        hatirlama_katsayisi = 0.35
    elif tekrar_edilmeyen_gun.days >=60:
        hatirlama_katsayisi = 0.50
    elif tekrar_edilmeyen_gun.days >=30:
        hatirlama_katsayisi = 0.65
    elif tekrar_edilmeyen_gun.days >=14:
        hatirlama_katsayisi = 0.80
    elif tekrar_edilmeyen_gun.days >=7:
        hatirlama_katsayisi = 0.90
    elif tekrar_edilmeyen_gun.days >=3:
        hatirlama_katsayisi = 0.96
    elif tekrar_edilmeyen_gun.days >=1:
        hatirlama_katsayisi = 0.99
    else:
        hatirlama_katsayisi = 1

    ustalik = round((soru_basarisi * hatirlama_katsayisi * 100), 2)
    return ustalik



def bugun_calisilacaklar(data):

    #konular sıralandı
    konular = {}
    for ders in data["Dersler"]:
        for konu in data["Dersler"][ders]:
            ustalik = ustalik_hesapla(data, ders, konu)
            konular[ders, konu] = ustalik
    konu_siralamasi_genel = sorted(konular.items(), key=lambda item: item[1], reverse=False)

    #bugün çalışılacaklar yazılıyor
    calisma_sirasi = []
    for (ders, konu), ustalik in konu_siralamasi_genel:
        son_tarih = datetime.strptime(data["Dersler"][ders][konu]["son_tekrar"], "%Y-%m-%d").date()
        gecen_gun = (date.today()- son_tarih).days
        if gecen_gun < 7 and ustalik >25:
            continue
        else:
            calisma_sirasi.append((ders, konu))
    konu_siralamasi = []
    for item in konu_siralamasi_genel:
        konu_siralamasi.append(item[0])

    sonuc = []

    if len(konu_siralamasi) == 0:
        return []
    elif len(konu_siralamasi) ==1:
        sonuc.append(konu_siralamasi[0])
    elif len(calisma_sirasi) >= 2:
        sonuc.append(calisma_sirasi[0])
        sonuc.append(calisma_sirasi[1])
    elif len(calisma_sirasi) ==1 and len(konu_siralamasi) !=1:
        sonuc.append(calisma_sirasi[0])
        sonuc.append(konu_siralamasi[1])
    elif len(calisma_sirasi) ==0 and len(konu_siralamasi) >=2:
        sonuc.append(konu_siralamasi[0])
        sonuc.append(konu_siralamasi[1])

    return sonuc

def soru_kaydetme_butonu(user, secilen_ders, secilen_konu, dogru_degeri, yanlis_degeri):
    data = load_data(user)

    data["Dersler"][secilen_ders][secilen_konu]["dogru"] += dogru_degeri
    data["Dersler"][secilen_ders][secilen_konu]["yanlis"] += yanlis_degeri

    save_data(user, data)

def soru_havuzuna_ekle(user, ders, konu, cevap, gorsel):
    data = load_data(user)

    sifir_str = "0"
    sonraki_id = data["SonrakiSoruID"]

    soru_id = f"q{(4 - len(str(sonraki_id))) * sifir_str}{sonraki_id}"
    uzanti = os.path.splitext(gorsel.filename)[1]

    dosya_ismi = soru_id + uzanti

    gorsel.save(f"static/questions/{dosya_ismi}")

    data["Soru Havuzu"][soru_id] = {"Ders": ders,
                           "Konu":konu,
                           "Cevap": cevap,
                           "Foto": dosya_ismi,
                           "Tekrar Seviyesi": 0,
                           "Sonraki Tekrar": str((date.today() + timedelta(days=1)))
    }
    data["SonrakiSoruID"] +=1
    save_data(user, data)


def soru_havuzu_tekrar(data):

    calisilacak_sorular = []
    for i, val in data["Soru Havuzu"].items():
        sonraki_tekrar = datetime.strptime(val["Sonraki Tekrar"],"%Y-%m-%d").date()
        if sonraki_tekrar <= date.today():
            calisilacak_sorular.append((i, sonraki_tekrar))

    calisilacak_sorular.sort(key=lambda id: id[1])

    return (calisilacak_sorular[:10])

def soru_havuzu_cozme(user, data, soru, cevap):
    if cevap == "BOS":
        dogruluk = "BOS"
    elif cevap == data["Soru Havuzu"][soru]["Cevap"] == cevap:
        dogruluk = True
    else:
        dogruluk = False

    tekrar_araliklari = [1,7,14,30]
    tekrar_seviyesi = data["Soru Havuzu"][soru]["Tekrar Seviyesi"]
    if tekrar_seviyesi<=len(tekrar_araliklari):
        if dogruluk == True:
            data["Soru Havuzu"][soru]["Sonraki Tekrar"] = str(date.today() + timedelta(days=tekrar_araliklari[tekrar_seviyesi] ) )
            data["Soru Havuzu"][soru]["Tekrar Seviyesi"] +=1
            tekrar_seviyesi =  data["Soru Havuzu"][soru]["Tekrar Seviyesi"]
        else:
            data["Soru Havuzu"][soru]["Sonraki Tekrar"] = str(date.today() + timedelta(days=1))
            data["Soru Havuzu"][soru]["Tekrar Seviyesi"] =0
            tekrar_seviyesi = data["Soru Havuzu"][soru]["Tekrar Seviyesi"]

    if tekrar_seviyesi > len(tekrar_araliklari)-1:
        data["Soru Havuzu"].pop(soru)
    save_data(user,data)


    return dogruluk
def konu_basari_siralama(user, secilen_ders):
    data = load_data(user)
    konu_soru_siralama = {}  # Soru yüzdesi kısmı


    for konu in data["Dersler"][secilen_ders]:
        dogru_sayisi = data["Dersler"][secilen_ders][konu]["dogru"]
        yanlis_sayisi = data["Dersler"][secilen_ders][konu]["yanlis"]
        toplam_soru_sayisi = dogru_sayisi + yanlis_sayisi
        tecrube_katsayisi = toplam_soru_sayisi / (toplam_soru_sayisi + 50)

        try:
            soru_yuzdesi = 100 * dogru_sayisi / toplam_soru_sayisi
            soru_basarisi = tecrube_katsayisi * soru_yuzdesi
        except ZeroDivisionError:
            soru_yuzdesi = 0
            soru_basarisi = 0

        konu_soru_siralama[konu] = round(soru_basarisi, 2)



    konu_soru_siralama = sorted(konu_soru_siralama.items(), key=lambda item: item[1], reverse=False)

    return konu_soru_siralama[:5]

def konu_calisma_sure_siralama(user, secilen_ders):
    calisilmayan_gunler = {}
    data = load_data(user)
    for konu in data["Dersler"][secilen_ders]:
        son_calisma = data["Dersler"][secilen_ders][konu]["son_tekrar"]
        son_calisma_tarihi = datetime.strptime(son_calisma, "%Y-%m-%d").date()
        if datetime.strftime(son_calisma_tarihi, "%Y-%m-%d") == "2000-01-01":
            calisilmayan_gun = "Henüz Çalışılmadı"
        else:
            calisilmayan_gun = f"{(date.today() - son_calisma_tarihi).days} Gün"
        calisilmayan_gunler[konu] = calisilmayan_gun
    calisilmayan_gunler = sorted(calisilmayan_gunler.items(), key=lambda item: item[1], reverse=True)

    return calisilmayan_gunler