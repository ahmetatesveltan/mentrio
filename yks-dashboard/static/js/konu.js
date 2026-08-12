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