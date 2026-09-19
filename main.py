import datetime
import json
from datetime import *
import os
from dotenv import load_dotenv
import mysql.connector
from werkzeug.security import *


load_dotenv()


def get_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return connection
    except Exception as e:
        raise e


def register(username, password):
    connection = get_connection()
    if not username.strip():
        return
    cursor = connection.cursor()

    password_hash = generate_password_hash(password, method='pbkdf2:sha1', salt_length=8)

    cursor.execute(
        """
            INSERT INTO users (username, password_hash)
            VALUES(%s, %s)
        """,
        (username, password_hash)
    )
    connection.commit()

def login(username, password):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
            SELECT EXISTS (
                SELECT 1
                FROM users
                WHERE username = %s
            )
        """,
        (username,)
    )
    user_exists = cursor.fetchone()[0]
    if user_exists == 0:
        return "user_not_found"
    else:
        cursor.execute(
            """
                SELECT password_hash FROM users WHERE username = %s
            """,
            (username,)
        )
        password_hash = cursor.fetchone()[0]
        password_validation = check_password_hash(password_hash, password)
        if password_validation == False:
            return "wrong_password"
        else:
            return "logging_in"


def username_to_userid(user):
    if user == None:
        return
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE username = %s",
        (user,)

    )
    user_id = cursor.fetchone()[0]

    return user_id

#KONU EKLEME
def konu_ekle(user, ders, konu):

    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        "SELECT id FROM subjects WHERE name=%s",
        (ders,)
    )
    ders_id = cursor.fetchone()[0]


    cursor.execute(
        "INSERT INTO topics (name, subject_id, user_id )"
        "VALUES (%s, %s, %s)",
        (konu, ders_id, user_id)
    )

    connection.commit()

    cursor.execute(
        "SELECT * FROM topics WHERE name = %s",
        (konu,)
    )



#SORU EKLEME
def soru_ekle(user, konu, dogru, yanlis):

    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        """
        UPDATE topics 
        SET correct_answer = correct_answer + %s,
            wrong_answer = wrong_answer + %s
        WHERE name = %s AND user_id = %s
        """,
        (dogru, yanlis, konu, user_id,),
    )
    connection.commit()



#SON KONU TEKRAR TARİHİ EKLEME
def konu_tekrari(user, konu):
    bugun = str(date.today())

    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        """
        UPDATE topics
        SET revision = %s 
        WHERE name = %s AND user_id = %s
        """,
        (bugun, konu, user_id)
    )
    connection.commit()


#USTALIK HESAPLAMA

def ustalik_hesapla(user, konu):
    #SORU YÜZDESİ VE KONU TEKRAR SÜRESİ HESAPLAMA, USTALIK BULMA

    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    try:
        cursor.execute(
            """
                SELECT correct_answer, wrong_answer FROM topics
                WHERE user_id = %s AND name = %s
            """,
            (user_id, konu,)
        )
        dogru, yanlis = cursor.fetchone()

        toplam_soru = dogru+yanlis
        basari_yuzdesi = dogru/toplam_soru
        soru_basarisi = (toplam_soru/(toplam_soru+50) * basari_yuzdesi)
    except ZeroDivisionError:
        soru_basarisi = 0


    cursor.execute(
        """
            SELECT revision FROM topics WHERE user_id = %s AND name = %s
        """,
        (user_id, konu)
    )
    son_tekrar_tarihi = cursor.fetchone()[0]
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


def ustalik_rank(user, konu):

    ustalik = ustalik_hesapla(user, konu)

    if ustalik <=25:
        return "F"
    elif ustalik <=40:
        return "D"
    elif ustalik <= 60:
        return "C"
    elif ustalik <=80:
        return "B"
    else:
        return "A"


def bugun_calisilacaklar(user):


    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)
    bugun = date.today()

    cursor.execute(
        """
            SELECT EXISTS(
                SELECT 1
                FROM daily_topics
                WHERE daily_date = %s
                AND user_id = %s
            )
        """,
        (bugun, user_id)
    )
    if cursor.fetchone()[0] == 1:

        cursor.execute(
            """
                SELECT topic1, topic2 
                FROM daily_topics
                WHERE daily_date = %s
                AND user_id = %s
            """,
            (bugun, user_id)
        )
        konular = cursor.fetchall()

        sonuc = []

        for konu_tuple in konular[0]:
            konu = str(konu_tuple)
            if konu == "None":
                pass
            else:
                sonuc.append(konu)

        print(sonuc)
        return sonuc
    #konular sıralandı
    konular = {}
    cursor.execute(
        """
            SELECT name, subject_id FROM topics WHERE user_id = %s
        """,
        (user_id,)
    )
    konu_listesi = cursor.fetchall()


    for konu_name in konu_listesi:
        konu = str(konu_name[0])


        ustalik = ustalik_hesapla(user, konu)
        konular[konu] = ustalik
    konu_siralamasi_genel = sorted(konular.items(), key=lambda item: item[1], reverse=False)


    #bugün çalışılacaklar yazılıyor
    calisma_sirasi = []
    for konu, ustalik in konu_siralamasi_genel:
        cursor.execute(
            """
            SELECT revision
            FROM topics
            WHERE user_id = %s
              AND name = %s
            """,
            (user_id, konu)
        )
        son_tekrar_tarihi = cursor.fetchone()[0]
        tekrar_edilmeyen_gun = date.today() - son_tekrar_tarihi

        if tekrar_edilmeyen_gun.days >= 7 or ustalik <=25:
            calisma_sirasi.append(konu)



    sonuc = []

    if len(calisma_sirasi) == 0:
        return []
    elif len(calisma_sirasi) ==1:
        sonuc.append(calisma_sirasi[0])
    elif len(calisma_sirasi) >= 2:
        sonuc.append(calisma_sirasi[0])
        sonuc.append(calisma_sirasi[1])
    elif len(calisma_sirasi) ==1 and len(konu_siralamasi_genel) !=1:
        sonuc.append(konu_siralamasi_genel[0][0])
        sonuc.append(konu_siralamasi_genel[1][0])
    elif len(calisma_sirasi) ==0 and len(konu_siralamasi_genel) >=2:
        sonuc.append(konu_siralamasi_genel[0])
        sonuc.append(konu_siralamasi_genel[1])


    cursor.execute(
        """
            SELECT EXISTS (
                SELECT 1 
                FROM daily_topics
                WHERE user_id = %s
                AND daily_date = %s
            )
        """,
        (user_id, bugun)
    )
    bugun_kontrol = cursor.fetchone()[0]

    if bugun_kontrol == 0:
        topic_sayisi = len(sonuc)
        if topic_sayisi == 2:
            cursor.execute(
                """
                    INSERT INTO daily_topics(user_id, daily_date, topic1, topic2)
                    VALUES (%s, %s, %s, %s)
                """,
                (user_id, bugun, sonuc[0], sonuc[1])
            )
        elif topic_sayisi == 1:
            cursor.execute(
                """
                    INSERT INTO daily_topics(user_id, daily_date, topic1, topic2)
                    VALUES (%s, %s, %s, %s)
                """,
                (user_id, bugun, sonuc[0], None)
            )

    connection.commit()

    return sonuc
bugun_calisilacaklar("ibis")
def soru_havuzuna_ekle(user,konu, cevap, gorsel):


    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    uzanti = os.path.splitext(gorsel.filename)[1]

    cursor.execute(
        """
            SELECT id FROM topics WHERE user_id = %s AND name = %s
        """,
        (user_id, konu)
    )
    topic_id = cursor.fetchone()[0]


    cursor.execute(
        """
            INSERT INTO questions 
            (user_id, topic_id, answer)
            VALUES (%s, %s, %s)
        """,
        (user_id,topic_id, cevap)
    )

    connection.commit()
    question_id = cursor.lastrowid

    cursor.execute(
        """
            INSERT INTO solved_questions 
            (user_id, question_id, solved_date)
            VALUES (%s, %s, %s)

        """,
        (user_id, question_id, str(date.today()))
    )
    connection.commit()
    dosya_ismi = f"{question_id}{uzanti}"

    cursor.execute(
        """
            UPDATE questions
            SET photo = %s WHERE question_id = %s
        """,
        (dosya_ismi, question_id)
    )
    connection.commit()
    return {"gorsel_dosya_ismi":dosya_ismi}


def soru_havuzu_tekrar(user):

    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        """
            SELECT question_id, next_revision 
            FROM questions WHERE user_id = %s 
            AND next_revision <= %s
            ORDER BY next_revision ASC
            LIMIT 10
        """,
        (user_id, date.today())
    )

    calisilacak_sorular = [row[0] for row in cursor.fetchall()]


    return calisilacak_sorular



def soru_havuzu_cozme(user, soru, cevap):

    connection = get_connection()
    cursor = connection.cursor()
    user_id = username_to_userid(user)


    cursor.execute(
        """
           SELECT answer, revision_level FROM questions WHERE question_id = %s;
        """,
        (soru,)
    )

    dogru_cevap, tekrar_seviyesi = cursor.fetchone()

    if cevap == "BOS":
        dogruluk = "BOS"
    elif cevap == dogru_cevap:
        dogruluk = True
    else:
        dogruluk = False

    tekrar_araliklari = [1,7,14,30]

    if tekrar_seviyesi < 4:
        if dogruluk == True:
            sonraki_tekrar = str(date.today() + timedelta(days=tekrar_araliklari[tekrar_seviyesi] ) )
            yeni_tekrar_seviyesi = tekrar_seviyesi + 1
        else:
            sonraki_tekrar = str(date.today() + timedelta(days=1))
            yeni_tekrar_seviyesi = 0

        cursor.execute(
            """
                UPDATE questions
                SET next_revision = %s,
                    revision_level = %s
                WHERE question_id = %s
            """,
            (sonraki_tekrar, yeni_tekrar_seviyesi, soru)
        )
        cursor.execute(
            """
                INSERT INTO solved_questions
                (user_id, question_id, solved_date)
                VALUES (%s, %s, %s)
            """,
            (user_id, soru, date.today())
        )

    else:
        cursor.execute(
            """
            DELETE FROM solved_questions
            WHERE question_id = %s
            """,
            (soru,)
        )

        cursor.execute(
            """
            DELETE FROM questions
            WHERE question_id = %s
            """,
            (soru,)
        )

    connection.commit()
    return dogruluk


def konu_basari_siralama(user, ders):

    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        """
        SELECT id
        FROM subjects
        WHERE name = %s
        """,
        (ders,)
    )

    subject_id = cursor.fetchone()[0]


    konu_soru_siralama = {}  # Soru yüzdesi kısmı

    cursor.execute(
        """
            SELECT name FROM topics WHERE user_id = %s AND subject_id = %s
        """,
    (user_id, subject_id)
    )
    konular = cursor.fetchall()


    for konu_tuple in konular:
        konu = str(konu_tuple[0]) #Fetchall tuple döndürüyor. Sadece konu ismi alındı.

        cursor.execute(
            """
                SELECT correct_answer, wrong_answer FROM topics WHERE user_id = %s AND name = %s
            """,
            (user_id, konu)
        )
        dogru, yanlis = cursor.fetchone()

        toplam_soru_sayisi = dogru + yanlis
        tecrube_katsayisi = toplam_soru_sayisi / (toplam_soru_sayisi +50)

        try:
            soru_yuzdesi = 100 * dogru / toplam_soru_sayisi
            soru_basarisi = tecrube_katsayisi * soru_yuzdesi
        except ZeroDivisionError:
            soru_yuzdesi = 0
            soru_basarisi = 0

        konu_soru_siralama[konu] = round(soru_basarisi, 2)



    konu_soru_siralama = sorted(konu_soru_siralama.items(), key=lambda item: item[1], reverse=False)

    return konu_soru_siralama[:5]


def konu_calisma_sure_siralama(user, ders):

    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        """
        SELECT id
        FROM subjects
        WHERE name = %s
        """,
        (ders,)
    )

    subject_id = cursor.fetchone()[0]


    calisilmayan_gunler = {}

    cursor.execute(
        """
            SELECT name FROM topics WHERE user_id = %s AND subject_id = %s
        """,
        (user_id, subject_id)
    )
    konular = cursor.fetchall()

    for konu_tuple in konular:
        konu = str(konu_tuple[0])


        cursor.execute(
            """
                SELECT revision FROM topics WHERE user_id = %s AND name = %s
            """,
            (user_id, konu)
        )
        son_calisma_tarihi = cursor.fetchone()[0]

        calisilmayan_gun = (date.today() - son_calisma_tarihi).days
        calisilmayan_gunler[konu] = calisilmayan_gun
    calisilmayan_gunler = sorted(calisilmayan_gunler.items(), key=lambda item: item[1], reverse=True)

    return calisilmayan_gunler[:5]


def konu_calisilmayan_gun_hesaplama(user, konu):
    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        """
            SELECT revision FROM topics WHERE name = %s AND user_id = %s
        """,
        (konu, user_id)
    )
    son_calisma = cursor.fetchone()[0]


    if str(son_calisma) == "2000-01-01":

        return "hiç çalışılmadı"
    else:
        calisilmayan_gun = (date.today() - son_calisma).days

        return calisilmayan_gun

def soru_havuzu_sayac(user, konu):
    connection = get_connection()
    cursor = connection.cursor()

    user_id = username_to_userid(user)

    cursor.execute(
        """
            SELECT id FROM topics WHERE user_id = %s AND name = %s
        """,
        (user_id, konu)
    )
    topic_id = cursor.fetchone()[0]

    cursor.execute(
        """
            SELECT question_id FROM questions WHERE user_id = %s AND topic_id = %s
        """,
        (user_id, topic_id)
    )
    return len(cursor.fetchall())


