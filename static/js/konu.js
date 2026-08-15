function soru_yuklemesi(){
    const dogrun10 = document.getElementById("d-10")
    const dogrun1 = document.getElementById("d-1")
    const dogrup10 = document.getElementById("d+10")
    const dogrup1 = document.getElementById("d+1")
    const dogru_sayisi = document.getElementById("ds")

    const yanlisn10 = document.getElementById("y-10")
    const yanlisn1 = document.getElementById("y-1")
    const yanlisp10 = document.getElementById("y+10")
    const yanlisp1 = document.getElementById("y+1")
    const yanlis_sayisi = document.getElementById("ys")

    const kaydet = document.getElementById("left-kaydet-buton")

    const aktif_ders = document.body.dataset.ders;
    const aktif_konu = document.body.dataset.konu;


    dogrun10.addEventListener("click", function(){

        dogru_sayisi.textContent = Number(dogru_sayisi.textContent) -10;


    });
    dogrun1.addEventListener("click", function(){

        dogru_sayisi.textContent = Number(dogru_sayisi.textContent) -1;


    });
    dogrup10.addEventListener("click", function(){

        dogru_sayisi.textContent = Number(dogru_sayisi.textContent) +10;


    });
    dogrup1.addEventListener("click", function(){

        dogru_sayisi.textContent = Number(dogru_sayisi.textContent) +1;


    });




    yanlisn10.addEventListener("click", function(){

        yanlis_sayisi.textContent = Number(yanlis_sayisi.textContent) -10;


    });
    yanlisn1.addEventListener("click", function(){

        yanlis_sayisi.textContent = Number(yanlis_sayisi.textContent) -1;


    });
    yanlisp10.addEventListener("click", function(){

        yanlis_sayisi.textContent = Number(yanlis_sayisi.textContent) +10;


    });
    yanlisp1.addEventListener("click", function(){

        yanlis_sayisi.textContent = Number(yanlis_sayisi.textContent) +1;


    });

    kaydet.addEventListener("click", function(){
        dogru = dogru_sayisi.textContent
        yanlis = yanlis_sayisi.textContent

        fetch("/api/soru-yuklemesi", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({dogru_sayisi: dogru,
                                  yanlis_sayisi: yanlis,
                                  ders: aktif_ders,
                                  konu: aktif_konu})
        })
        .then(response => response.json())
        .then(data => {
            dogru_sayisi.textContent = 0;
            yanlis_sayisi.textContent = 0;
            location.reload();


        });

    });

}
soru_yuklemesi();
function konu_ozeti(){
    const body = document.body;
    const ders = body.dataset.ders;
    const konu = body.dataset.konu;

    const calisma_butonu = document.getElementById("konu-calisildi")
    const calisma_bilgisi = document.querySelector("#calisma-bilgisi h3");

    calisma_butonu.addEventListener("click", function(){
        fetch("/api/konu-calisildi", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ders: ders,
                                        konu: konu})
        })
        .then(response => response.json())
        .then(data => {

            calisma_bilgisi.textContent = "Bu konuyu bugün çalıştın. Aferin sana :)"
        });

    });


};
konu_ozeti()

function panel_kaydirma(){
    const paneller = document.getElementById("other-panels");
    const noktalar = document.querySelectorAll(".sayfa-noktasi");
    const panel = document.querySelectorAll("#other-panels > *");

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