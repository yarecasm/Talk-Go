function StartWindow() {
    location.assign('../Inicio/index.html');
}
function BagelsWindow() {
    location.assign('../Bagels/index.html');
}
function DrinksWindow() {
    location.assign('../Drinks/index.html');
}
function SnacksWindow() {
    location.assign('../Snacks/index.html');
}
function CombosWindow() {
    // location.assign('../Combos/index.html');
}
function AsistenteVirtual() {

}

// ACCIONES DE VOZ
window.addEventListener("message", (event) => {
    if (event.data.type !== "VOICE_ACTION") return;
    switch (event.data.action) {
        case "OPEN_CATEGORY":
            console.log(event.data.code);
            switch (event.data.code) {
                case "snacks":
                    SnacksWindow();
                    break;
                case "bagels":
                    BagelsWindow();
                    break;
                case "combos":
                    CombosWindow();
                    break;
                case "drinks":
                    DrinksWindow();
                    break;
                default:
                    return;
            }
            break;
    }
});