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
function gunluk_sorulari_ekle() {

    const gorselInput = document.getElementById("ys-gorsel-ekle");
    const cevaplar = document.querySelectorAll(".ys-sikları");
    const ysDersSelect = document.getElementById("ys-ders-select");
    const ysKonuSelect = document.getElementById("ys-konu-select");
    const ysSubmit = document.getElementById("ys-giris-submit");

    if (
        gorselInput === null ||
        ysDersSelect === null ||
        ysKonuSelect === null ||
        ysSubmit === null
    ) {
        return;
    }

    let secilenGorsel = null;
    let secilenCevap = null;
    let secilenDers = null;
    let secilenKonu = null;

    ysDersSelect.addEventListener("change", function () {
        secilenDers = ysDersSelect.value;
        submitControl();
    });

    ysKonuSelect.addEventListener("change", function () {
        secilenKonu = ysKonuSelect.value;
        submitControl();
    });

    for (const cevap of cevaplar) {

        if (cevap === null) {
            continue;
        }

        cevap.addEventListener("change", function () {
            secilenCevap = cevap.value;
            submitControl();
        });
    }

    gorselInput.addEventListener("change", function () {
        secilenGorsel = gorselInput.files[0];
        submitControl();
    });

    function submitControl() {
        if (
            secilenGorsel !== null &&
            secilenCevap !== null &&
            secilenDers !== null &&
            secilenKonu !== null
        ) {
            ysSubmit.disabled = false;
        } else {
            ysSubmit.disabled = true;
        }
    }

    ysSubmit.addEventListener("click", function (e) {
        e.preventDefault()


        const ysData = new FormData();
        const ysBildirim = document.getElementById("ys-bildirim");

        if (ysBildirim === null) {
            return;
        }

        ysData.append("ders", secilenDers);
        ysData.append("konu", secilenKonu);
        ysData.append("cevap", secilenCevap);
        ysData.append("image", secilenGorsel);

        fetch("/api/ys-ekle", {
            method: "POST",
            body: ysData
        })
            .then(function (response) {

                ysBildirim.textContent = "Soru Kaydedildi.";

                 gorselInput.value = "";
                 secilenGorsel = null;


                setTimeout(function () {
                    ysBildirim.textContent = "";
                }, 2000);

            });

        ysSubmit.disabled = true;
    });
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
    tam_ekran_buton.addEventListener("click", function () {
        console.log("basıldı")
        tam_ekran_buton.hidden = true;
        tam_ekran_cikis_buton.hidden = false;
    });

    tam_ekran_cikis_buton.addEventListener("click", function () {
        document.exitFullscreen();
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
