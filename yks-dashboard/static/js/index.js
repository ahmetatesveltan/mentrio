//YS-DERS-SELECTİNE GÖRE KONU SELECT AYARLAMA
function konu_select() {
    const ysDersSelect = document.getElementById("ys-ders-select");

    ysDersSelect.addEventListener("change", function () {

        const secilenDers = ysDersSelect.value;

        fetch("/api/ys-select?ders=" + secilenDers)
            .then(response => response.json())
            .then(konular => {

                const select = document.getElementById("ys-konu-select");

                select.innerHTML = ""

                konular.forEach(konu => {
                    const option = document.createElement("option");
                    option.textContent = konu;
                    option.value = konu;
                    select.appendChild(option);
                });
            });
    });
};
konu_select()

//YANLIŞ SORU EKLEME
function gunluk_sorulari_ekle() {
    let secilenGorsel = null;
    let secilenCevap = null;
    let secilenDers = null;
    let secilenKonu = null;


    const gorselInput = document.getElementById("ys-gorsel-ekle");
    const cevaplar = document.querySelectorAll(".ys-sikları");

    const ysDersSelect = document.getElementById("ys-ders-select");
    const ysKonuSelect = document.getElementById("ys-konu-select");

    ysDersSelect.addEventListener("change", function () {

        secilenDers = ysDersSelect.value;
        submitControl();
    });

    ysKonuSelect.addEventListener("change", function () {

        secilenKonu = ysKonuSelect.value;
        submitControl();
    });

    for (const cevap of cevaplar) {
           cevap.addEventListener("change", function(){
               secilenCevap = cevap.value;
               console.log(secilenCevap);
               submitControl();
        });
    };

    gorselInput.addEventListener("change",  function(){
        secilenGorsel = gorselInput.files[0];

        submitControl();

    });

    const ysSubmit = document.getElementById("ys-giris-submit")
    function submitControl() {
        if(secilenGorsel!== null && secilenCevap !== null && secilenDers !== null && secilenKonu!== null){
            ysSubmit.disabled = false
        }
        else {
            ysSubmit.disabled = true
        }
    }
    ysSubmit.addEventListener("click", function(){

        const ysData = new FormData();
        const ysBildirim = document.getElementById("ys-bildirim");

        ysData.append("ders", secilenDers);
        ysData.append("konu", secilenKonu);
        ysData.append("cevap", secilenCevap);
        ysData.append("image", secilenGorsel);

        fetch("/api/ys-ekle", {
            method: "POST",
            body: ysData
        })
        .then(function(response) {
            ysBildirim.textContent = "Soru Kaydedildi."


            setTimeout(function() {
                ysBildirim.textContent = ""
        }, 2000);

        });
        ysSubmit.disabled = true


    });
};
gunluk_sorulari_ekle()
// SPACED REPETİTON SORULARINI ALMA
function gunluk_sorulari_goster() {
    let sorular = [];

    let aktifIndex = 0;
    let aktifSoru = null;
    let secilenCevap = null;

    soru_gorseli = document.getElementById("ys-soru-gorseli");
    solOk = document.getElementById("ys-sol-ok");
    sagOk = document.getElementById("ys-sag-ok");
    label = document.getElementById("ys-cikti-label");

    const cevaplar = document.querySelectorAll('[name="ys-cikti-sikları"]');
    const ysSubmit = document.getElementById("ys-cevapla");

    // Tam ekran butonu
    const tam_ekran_buton = document.getElementById("ys-tam-ekran");
    const tam_ekran_cikis_buton = document.getElementById("ys-cikis-tam-ekran");
    const panel = document.getElementById("ys-cikti-soru");

    const butonA = document.getElementById("ysc-A");
    const butonB = document.getElementById("ysc-B");
    const butonC = document.getElementById("ysc-C");
    const butonD = document.getElementById("ysc-D");
    const butonE = document.getElementById("ysc-E");
    const butonBOS = document.getElementById("ysc-BOS");

    tam_ekran_buton.addEventListener("click", function () {
        panel.requestFullscreen();
        tam_ekran_buton.hidden = true
        tam_ekran_cikis_buton.hidden = false
    });
    tam_ekran_cikis_buton.addEventListener("click", function () {
        document.exitFullscreen();
        tam_ekran_buton.hidden = false
        tam_ekran_cikis_buton.hidden = true
    });

    fetch("/api/cozulecek-sorular")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            sorular = data;
            aktifSoru = sorular[aktifIndex];
            let gorselYolu = "/static/questions/" + aktifSoru.Foto;
            soru_gorseli.src = gorselYolu;
            label.textContent = "Soru " + (aktifIndex + 1) + "/" + sorular.length;

            soru_durumunu_guncelle();

        });

    function soru_durumunu_guncelle(){
        if(aktifSoru.bugun_cozuldu === true){
                ysSubmit.disabled = true;
                butonA.disabled = true;
                butonB.disabled = true;
                butonC.disabled = true;
                butonD.disabled = true;
                butonE.disabled = true;
                butonBOS.disabled = true;
            }
            else{
                ysSubmit.disabled = false;
                butonA.disabled = false;
                butonB.disabled = false;
                butonC.disabled = false;
                butonD.disabled = false;
                butonE.disabled = false;
                butonBOS.disabled = false;
            }

    }

    solOk.addEventListener("click", function () {
        aktifIndex -= 1;

        if (aktifIndex < 0) {
            aktifIndex = sorular.length - 1;
        }

        aktifSoru = sorular[aktifIndex];

        gorselYolu = "/static/questions/" + aktifSoru.Foto;
        soru_gorseli.src = gorselYolu;
        label.textContent = "Soru " + (aktifIndex + 1) + "/" + sorular.length;

        soru_durumunu_guncelle();
    });

    sagOk.addEventListener("click", function () {
        aktifIndex += 1;

        if (aktifIndex >= sorular.length) {
            aktifIndex = 0;
        }

        aktifSoru = sorular[aktifIndex];

        gorselYolu = "/static/questions/" + aktifSoru.Foto;
        soru_gorseli.src = gorselYolu;
        label.textContent = "Soru " + (aktifIndex + 1) + "/" + sorular.length;

        soru_durumunu_guncelle();
    });

    for (const cevap of cevaplar) {
        cevap.addEventListener("change", function () {
            secilenCevap = cevap.value;
            submitControl();
        });
    }

    ysSubmit.addEventListener("click", function () {
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
                    kutu = document.querySelector(`label[for="ysc-${secilenCevap}"]`).parentElement;
                    kutu.style.backgroundColor = "#50dc2e";
                }

                else if (dogruluk === false) {
                    yanlis_kutu = document.querySelector(`label[for="ysc-${secilenCevap}"]`).parentElement;
                    yanlis_kutu.style.backgroundColor = "#d25663";

                    kutu = document.querySelector(`label[for="ysc-${dogru_cevap}"]`).parentElement;
                    kutu.style.backgroundColor = "#50dc2e";
                }

                else {
                    kutu = document.querySelector(`label[for="ysc-${dogru_cevap}"]`).parentElement;
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
        }
        else {
            ysSubmit.disabled = true;
        }
    }
}

gunluk_sorulari_goster();