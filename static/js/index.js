// =========================
// YANLIŞ SORU - KONU SELECT
// =========================
function konu_select() {
    const ysDersSelect = document.getElementById("ys-ders-select");

    if (ysDersSelect === null) {
        return;
    }

    ysDersSelect.addEventListener("change", function () {

        const secilenDers = ysDersSelect.value;

        fetch("/api/ys-select?ders=" + secilenDers)
            .then(response => response.json())
            .then(konular => {

                const select = document.getElementById("ys-konu-select");

                if (select === null) {
                    return;
                }

                select.innerHTML = "";

                konular.forEach(konu => {
                    const option = document.createElement("option");
                    option.textContent = konu;
                    option.value = konu;
                    select.appendChild(option);
                });
            });
    });
}

konu_select();


// =========================
// YANLIŞ SORU EKLEME
// =========================
// =========================
// YANLIŞ SORU EKLEME
// =========================
function gunluk_sorulari_ekle() {

    const gorselInput = document.getElementById("ys-gorsel-ekle");
    const cevaplar = document.querySelectorAll(".ys-sikları");
    const ysDersSelect = document.getElementById("ys-ders-select");
    const ysKonuSelect = document.getElementById("ys-konu-select");
    const ysSubmit = document.getElementById("ys-giris-submit");
    const ysBildirim = document.getElementById("ys-bildirim");

    if (
        gorselInput === null ||
        ysDersSelect === null ||
        ysKonuSelect === null ||
        ysSubmit === null ||
        ysBildirim === null
    ) {
        return;
    }


    // =========================
    // BUTON KONTROLÜ
    // =========================
    function submitControl() {

        const ders = ysDersSelect.value;
        const konu = ysKonuSelect.value;

        const seciliCevap = document.querySelector(
            '.ys-sikları:checked'
        );

        const gorselSecildi =
            gorselInput.files.length > 0;

        const cevapSecildi =
            seciliCevap !== null;


        if (
            ders !== "" &&
            konu !== "" &&
            cevapSecildi &&
            gorselSecildi
        ) {
            ysSubmit.disabled = false;
        } else {
            ysSubmit.disabled = true;
        }
    }


    // =========================
    // DERS SEÇİMİ
    // =========================
    ysDersSelect.addEventListener("change", function () {

        // Konular API'den geldiği için önce eski konuları temizle
        ysKonuSelect.innerHTML = "";

        // Butonu hemen kapat
        ysSubmit.disabled = true;

        const ders = ysDersSelect.value;

        fetch("/api/ys-select?ders=" + ders)
            .then(function (response) {
                return response.json();
            })
            .then(function (konular) {

                konular.forEach(function (konu) {

                    const option = document.createElement("option");

                    option.textContent = konu;
                    option.value = konu;

                    ysKonuSelect.appendChild(option);
                });


                // İlk konu otomatik seçilir
                if (konular.length > 0) {
                    ysKonuSelect.value = konular[0];
                }

                submitControl();
            })
            .catch(function (error) {

                console.log("Konu yükleme hatası:", error);

                ysSubmit.disabled = true;
            });
    });


    // =========================
    // KONU SEÇİMİ
    // =========================
    ysKonuSelect.addEventListener("change", function () {
        submitControl();
    });


    // =========================
    // CEVAP SEÇİMİ
    // =========================
    for (const cevap of cevaplar) {

        cevap.addEventListener("change", function () {
            submitControl();
        });
    }


    // =========================
    // GÖRSEL SEÇİMİ
    // =========================
    gorselInput.addEventListener("change", function () {
        submitControl();
    });


    // =========================
    // YANLIŞ EKLE
    // =========================
    ysSubmit.addEventListener("click", function (e) {

        e.preventDefault();


        const ders = ysDersSelect.value;
        const konu = ysKonuSelect.value;

        const seciliCevap = document.querySelector(
            '.ys-sikları:checked'
        );


        if (
            ders === "" ||
            konu === "" ||
            seciliCevap === null ||
            gorselInput.files.length === 0
        ) {
            return;
        }


        const cevap = seciliCevap.value;
        const gorsel = gorselInput.files[0];


        const ysData = new FormData();

        ysData.append("ders", ders);
        ysData.append("konu", konu);
        ysData.append("cevap", cevap);
        ysData.append("image", gorsel);


        fetch("/api/ys-ekle", {
            method: "POST",
            body: ysData
        })
        .then(function (response) {

            if (!response.ok) {
                throw new Error("Soru eklenemedi.");
            }

            return response.text();
        })
        .then(function () {

            ysBildirim.textContent = "Soru Kaydedildi.";

            // Görseli temizle
            gorselInput.value = "";

            // Cevabı temizle
            for (const cevap of cevaplar) {
                cevap.checked = false;
            }

            // Butonu tekrar kapat
            ysSubmit.disabled = true;


            setTimeout(function () {
                ysBildirim.textContent = "";
            }, 2000);
        })
        .catch(function (error) {

            console.log(error);

            ysBildirim.textContent =
                "Hata: " + error.message;
        });
    });


    // Başlangıçta buton kapalı
    submitControl();
}


gunluk_sorulari_ekle();


// =========================
// SPACED REPETITION SORULARI
// =========================
function gunluk_sorulari_goster() {

    const soru_gorseli = document.getElementById("ys-soru-gorseli");
    const solOk = document.getElementById("ys-sol-ok");
    const sagOk = document.getElementById("ys-sag-ok");
    const label = document.getElementById("ys-cikti-label");
    const ysSubmit = document.getElementById("ys-cevapla");

    const tam_ekran_buton = document.getElementById("ys-tam-ekran");
    const tam_ekran_cikis_buton = document.getElementById("ys-cikis-tam-ekran");
    const panel = document.getElementById("ys-cikti-soru");

    const butonA = document.getElementById("ysc-A");
    const butonB = document.getElementById("ysc-B");
    const butonC = document.getElementById("ysc-C");
    const butonD = document.getElementById("ysc-D");
    const butonE = document.getElementById("ysc-E");
    const butonBOS = document.getElementById("ysc-BOS");

    if (
        soru_gorseli === null ||
        solOk === null ||
        sagOk === null ||
        label === null ||
        ysSubmit === null ||
        tam_ekran_buton === null ||
        tam_ekran_cikis_buton === null ||
        panel === null ||
        butonA === null ||
        butonB === null ||
        butonC === null ||
        butonD === null ||
        butonE === null ||
        butonBOS === null
    ) {
        return;
    }

    let sorular = [];
    let aktifIndex = 0;
    let aktifSoru = null;
    let secilenCevap = null;

    const cevaplar = document.querySelectorAll('[name="ys-cikti-sikları"]');

    // TAM EKRAN
    tam_ekran_buton.addEventListener("click", function (e) {
        e.preventDefault();

        console.log("fullscreen click");

        panel.classList.add("css-fullscreen");
        document.body.classList.add("css-fullscreen-active");

        tam_ekran_buton.hidden = true;
        tam_ekran_cikis_buton.hidden = false;
    });

    tam_ekran_cikis_buton.addEventListener("click", function (e) {
        e.preventDefault();

        console.log("exit screen click");

        panel.classList.remove("css-fullscreen");
        document.body.classList.remove("css-fullscreen-active");

        tam_ekran_buton.hidden = false;
        tam_ekran_cikis_buton.hidden = true;
    });
    // SORULARI AL
    fetch("/api/cozulecek-sorular")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            sorular = data;

            if (sorular.length === 0) {
                return;
            }

            aktifSoru = sorular[aktifIndex];

            let gorselYolu = "/static/questions/" + aktifSoru.Foto;

            soru_gorseli.src = gorselYolu;

            label.textContent =
                "Soru " + (aktifIndex + 1) + "/" + sorular.length;

            soru_durumunu_guncelle();
        });


    function soru_durumunu_guncelle() {

        if (aktifSoru === null) {
            return;
        }

        if (aktifSoru.bugun_cozuldu === true) {

            ysSubmit.disabled = true;

            butonA.disabled = true;
            butonB.disabled = true;
            butonC.disabled = true;
            butonD.disabled = true;
            butonE.disabled = true;
            butonBOS.disabled = true;

        } else {

            ysSubmit.disabled = false;

            butonA.disabled = false;
            butonB.disabled = false;
            butonC.disabled = false;
            butonD.disabled = false;
            butonE.disabled = false;
            butonBOS.disabled = false;
        }
    }


    // SOL OK
    solOk.addEventListener("click", function () {

        if (sorular.length === 0) {
            return;
        }

        aktifIndex -= 1;

        if (aktifIndex < 0) {
            aktifIndex = sorular.length - 1;
        }

        aktifSoru = sorular[aktifIndex];

        let gorselYolu = "/static/questions/" + aktifSoru.Foto;

        soru_gorseli.src = gorselYolu;

        label.textContent =
            "Soru " + (aktifIndex + 1) + "/" + sorular.length;

        soru_durumunu_guncelle();
    });


    // SAĞ OK
    sagOk.addEventListener("click", function () {

        if (sorular.length === 0) {
            return;
        }

        aktifIndex += 1;

        if (aktifIndex >= sorular.length) {
            aktifIndex = 0;
        }

        aktifSoru = sorular[aktifIndex];

        let gorselYolu = "/static/questions/" + aktifSoru.Foto;

        soru_gorseli.src = gorselYolu;

        label.textContent =
            "Soru " + (aktifIndex + 1) + "/" + sorular.length;

        soru_durumunu_guncelle();
    });


    // CEVAP SEÇİMİ
    for (const cevap of cevaplar) {

        if (cevap === null) {
            continue;
        }

        cevap.addEventListener("change", function () {
            secilenCevap = cevap.value;
            submitControl();
        });
    }


    // CEVAPLA
    ysSubmit.addEventListener("click", function () {

        if (aktifSoru === null || secilenCevap === null) {
            return;
        }

        fetch("/api/cozulecek-sorular-kontrol", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cevap: secilenCevap,
                soru_id: aktifSoru["id"]
            })
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                let dogruluk = data["dogruluk"];
                let dogru_cevap = data["dogru_cevap"];

                let kutu = null;
                let yanlis_kutu = null;

                if (dogruluk === true) {

                    kutu = document
                        .querySelector(`label[for="ysc-${secilenCevap}"]`)
                        .parentElement;

                    kutu.style.backgroundColor = "#50dc2e";

                } else if (dogruluk === false) {

                    yanlis_kutu = document
                        .querySelector(`label[for="ysc-${secilenCevap}"]`)
                        .parentElement;

                    yanlis_kutu.style.backgroundColor = "#d25663";

                    kutu = document
                        .querySelector(`label[for="ysc-${dogru_cevap}"]`)
                        .parentElement;

                    kutu.style.backgroundColor = "#50dc2e";

                } else {

                    kutu = document
                        .querySelector(`label[for="ysc-${dogru_cevap}"]`)
                        .parentElement;

                    kutu.style.backgroundColor = "#50dc2e";
                }

                setTimeout(function () {

                    if (kutu) {
                        kutu.style.backgroundColor = "#d9fff9";
                    }

                    if (yanlis_kutu) {
                        yanlis_kutu.style.backgroundColor = "#d9fff9";
                    }

                }, 3000);

                aktifSoru.bugun_cozuldu = true;

                soru_durumunu_guncelle();
            });
    });


    function submitControl() {

        if (secilenCevap !== null) {
            ysSubmit.disabled = false;
        } else {
            ysSubmit.disabled = true;
        }
    }
}

gunluk_sorulari_goster();


// =========================
// LOGIN
// =========================
function login_sayfasi() {

    const input = document.getElementById("kullanici-input");
    const submit = document.getElementById("login-submit");
    const bildirim = document.getElementById("login-bildirim");
    const baslik = document.getElementById("login-bolumu-baslik")

    if (
        input === null ||
        submit === null ||
        bildirim === null
    ) {
        return;
    }

    submit.addEventListener("click", function (e) {

        e.preventDefault();

        const user = input.value;

        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: user
            })
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                let giris_basarisi = data["giris_basarisi"];
                let kullanici = data["kullanici"];

                if (giris_basarisi === true) {

                    bildirim.textContent =
                        "Giriş başarılı. Hoşgeldin " + kullanici + ".";

                    bildirim.style.color = "#14b82b";
                    setTimeout(function () {
                        window.location.reload("/");
                     }, 4000);





                } else {

                    bildirim.textContent =
                        "Kullanıcı adı bulunamadı. Tekrar deneyin.";

                    bildirim.style.color = "#ca1602";


                }
                setTimeout(function () {
                        bildirim.textContent = "";
                     }, 3000);

            });
    });
}

login_sayfasi();
function panel_kaydirma(){
    const paneller = document.getElementById("panels");
    const noktalar = document.querySelectorAll(".sayfa-noktasi");
    const panel = document.querySelectorAll("#panels > *");

    paneller.addEventListener("scroll", function () {

        const scroll = paneller.scrollLeft;

        const index = Math.round(
            scroll / paneller.clientWidth
        );

        noktalar.forEach((nokta, i) => {
            if (i === index) {
                nokta.classList.add("aktif");
            } else {
                nokta.classList.remove("aktif");
            }
        });


    });

};
panel_kaydirma()
function tutorial(){
    next = document.getElementById("next-button")

    tutorialTitle = document.getElementById("tutorial-baslik")
    tutorialText = document.getElementById("tutorial-yazi")


    const tutorialSteps = [{title: "Mentrio'ya hoşgeldin.",
                                        text: "Haydi uygulamadaki araçları keşfedelim!",
                                        target: null},

                                        {title: "Dersler bölümü:",
                                        text: "Buradan ders sayfalarına giriş yapabilirsin. ",
                                        target: "matematik-buton"},

                                        {title: "Bugün Çalışacağın Konular:",
                                        text: "Mentrio senin çalışman gerekenleri senin yerine hesaplar. Şuan boş görünüyor, haydi ilk konunu ekle!",
                                        target: "calisilacaklar-baslik"}
    ]
    let currentStep = 0

    function updateTutorial(){
        tutorialTitle.textContent = tutorialSteps[currentStep].title
        tutorialText.textContent = tutorialSteps[currentStep].text
    }

    next.addEventListener("click", function (){
        currentStep++
        updateTutorial();
    })


};
tutorial()