function konu_ekleme(){
    const konu_form_input = document.getElementById("konu-form-input");
    const konu_form = document.getElementById("konu-form");
    const konu_ekle_buton = document.getElementById("konu-ekle-buton");
    console.log(konu_ekle_buton)

    const aktif_ders = window.location.pathname.split("/").pop();

    konu_ekle_buton.addEventListener("click", function(){
        konu_form_input.style.visibility = "visible";
    });

    konu_form.addEventListener("submit", function(e){
        e.preventDefault();
        const eklenen_konu = konu_form_input.value;

        fetch("/api/konu-ekle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                konu: eklenen_konu,
                ders: aktif_ders
            })
        })
        .then(response => response.json())
        .then(data => {

            konu_form_input.style.visibility = "hidden";
            window.location.href = "/ders/" + aktif_ders;
        });
    });
}
konu_ekleme()

function zayif_konular(){
    const aktif_ders = window.location.pathname.split("/").pop();

    fetch("/ders/" + aktif_ders, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            ders: aktif_ders
        })
    })

}
zayif_konular()