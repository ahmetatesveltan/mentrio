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

function tutorial(){

    title = document.getElementById("tutorial-title")
    text = document.getElementById("tutorial-text")

    ileri = document.getElementById("tutorial-ileri")
    geri = document.getElementById("tutorial-geri")
    atla = document.getElementById("tutorial-atla")

    tutorialBackground = document.getElementById("tutorial")
    tutorialBox = document.getElementById("tutorial-box")

    tutorialBox.style.display = "flex"
    tutorialBackground.style.display = "flex"


    const tutorialSteps = [
    {
        title: "Ders Sayfası:",
        text: "Buradan her dersini ayrı ayrı takip edebilirsin.",
        panel: null,
        position: "center"
    },

    {
        title: "Konuların: ",
        text: "Bu sekmeye konularını ekleyebilirsin. Konuların kendi sayfalarına da buradan girebilirsin.",
        panel: "left-panel",
        position: "bottom-center"
    },

    {
        title: "Eksik Konuların:",
        text: "Mentrio seni için burada zayıf konularını derledi. Haydi göz at!",
        panel: "middle-panel",
        position: "center-right"}

    ];

    let currentStep = 0
    tutorialBox.classList.add(tutorialSteps[currentStep].position);


    function buton_kilitleme(){

        if(currentStep === tutorialSteps.length - 1){
            ileri.textContent = "Hazırım"
        }
        else if(currentStep === 0){
            geri.disabled = true
        }
        else{
            ileri.disabled = false
            geri.disabled = false
        }
    }


    function icerik_degistir(){

        title.textContent = tutorialSteps[currentStep].title
        text.textContent = tutorialSteps[currentStep].text

        tutorialBackground.style.background = "black"

        const panel = tutorialSteps[currentStep].panel
        const position = tutorialSteps[currentStep].position

        tutorialBox.classList.remove(
            "top-left",
            "top-center",
            "top-right",
            "center-left",
            "center",
            "center-right",
            "bottom-left",
            "bottom-center",
            "bottom-right"
        );


        tutorialBox.classList.add(position);


        if(panel !== null){

            tutorialBackground.style.background = "none"

            const targetPanel = document.getElementById(panel)
            const panels = document.getElementById("other-panels")

            panels.scrollTo({
                left: targetPanel.offsetLeft,
                behavior: "smooth"
            })
        }
    }


    buton_kilitleme()
    atla.addEventListener("click", function (){
        tutorialBackground.style.display = "none";
        tutorialBox.style.display = "none";
        localStorage.setItem("DersTutorialGoruldu", "true")

    })

    ileri.addEventListener("click", function(){

        if(currentStep === tutorialSteps.length-1){
            tutorialBackground.style.display = "none";
            tutorialBox.style.display = "none";
            localStorage.setItem("DersTutorialGoruldu", "true")
        }else{
        currentStep++
        icerik_degistir()
        buton_kilitleme()}

    })


    geri.addEventListener("click", function(){

        currentStep--
        icerik_degistir()
        buton_kilitleme()

    })

}

if (localStorage.getItem("DersTutorialGoruldu") === null){
    tutorial()
}
else{
     tutorialBackground = document.getElementById("tutorial")
     tutorialBox = document.getElementById("tutorial-box")

     tutorialBackground.style.display = "none";
     tutorialBox.style.display = "none";
}