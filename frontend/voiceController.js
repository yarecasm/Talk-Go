import { obtenerCategorias } from "./services/categorias.js";
import { obtenerProductosPorCategoria } from "./services/productos.js";

// Estado global del voice chat
export const appState = {
    action: null,
    actualCategory: null,
};

let shouldRestartRecognition = true;

// Iniciar reconocimiento de voz
export function initVoiceCommands(sendToParent) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Tu navegador no soporta SpeechRecognition");
        return;
    }

    console.log("ACTUAL STATE: ", appState.action);

    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.start();

    recognition.onend = () => {
        if (shouldRestartRecognition) {
            recognition.start();
        }
    };

    recognition.onerror = () => {
        if (shouldRestartRecognition) {
            recognition.start();
        }
    };


    // ÚNICO onresult (fusionado)
    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Dijiste:", transcript);

        // --- COMANDOS GLOBALES ---
        const memberCode = ["miembro", "iniciar miembro", "como miembro", "iniciar como miembro"];
        if (memberCode.some(cmd => transcript.includes(cmd))) {

            speak("Claro, ¿Cuál es tu usuario?.");
            appState.action = "OPEN_MEMBER_LOGIN";

            sendToParent({
                type: "VOICE_ACTION",
                action: "OPEN_MEMBER_LOGIN"
            });

            return;
        }

        const notMemberCode = [
            "ordenar", "hacer una orden", "quiero ordenar",
            "no iniciar", "no soy miembro", "no miembro",
            "iniciar", "ordena", "order", "no"
        ];
        if (notMemberCode.some(cmd => transcript.includes(cmd))) {

            speak("¿Qué menú quieres ver?");

            appState.action = "OPEN_GUEST_ORDER";

            // shouldRestartRecognition = false;
            //recognition.stop();

            sendToParent({
                type: "VOICE_ACTION",
                action: "OPEN_GUEST_ORDER"
            });
        }

        // --- MODO MIEMBRO (DICTAR CÓDIGO) ---
        if (appState.action === "OPEN_MEMBER_LOGIN") {
            // Usuario quiere cancelar
            if (transcript.includes("cancelar") || transcript.includes("cerrar") || transcript.includes("atrás")) {
                speak("De acuerdo, cerrando.");
                appState.action = null;

                sendToParent({
                    type: "VOICE_ACTION",
                    action: "CLOSE_MEMBER_POPUP"
                });

                return;
            }

            // Extraer código de voz
            const code = transcript
                .replace(/mi\s+codigo|es|miembro|codigo/g, "")
                .trim();

            if (code.length > 0) {
                speak(`Código recibido: ${code}`);

                sendToParent({
                    type: "VOICE_ACTION",
                    action: "SET_MEMBER_CODE",
                    code: code
                });

                return;
            }
        }


        // --- MODO INVITADO ---
        if (appState.action === "OPEN_GUEST_ORDER") {
            console.log("entra");
            const categorias = await obtenerCategorias();

            console.log(categorias);

            // Buscar si el transcript contiene alguna categoría
            const match = categorias.find(cat =>
                transcript.toLowerCase().includes(cat.NOMBRE.toLowerCase())
            );

            if (match) {
                // Extraer nombre limpio desde transcript
                const catNombre = transcript
                    .replace(/a\s+entrar a|ve a|quiero ver|ver/g, "")
                    .trim();

                if (catNombre.length > 0) {
                    speak(`Okay`);

                    appState.actualCategory = match.ID_CATEGORIA;
                    appState.action = "OPEN_CATEGORY";
                    console.log(appState.action);

                    // Aquí devolvemos también el ID
                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "OPEN_CATEGORY",
                        code: catNombre,
                        id: match.ID_CATEGORIA,
                    });

                    speak("Dime el nombre de un producto, lo añadiré por ti al carrito");

                }
            }
        }


        // AGREGAR PRODUCTOS 
        if (appState.action === "OPEN_CATEGORY") {

            const productos = await obtenerProductosPorCategoria(appState.actualCategory);
            console.log(productos);

            // Buscar si el transcript contiene alguna categoría
            const match = productos.find(p =>
                transcript.toLowerCase().includes(p.NOMBRE.toLowerCase())
            );

            if (match) {
                // Extraer nombre limpio desde transcript
                const pNombre = transcript
                    .replace(/quiero\s+agrega|un|pon|ponme|añade|agregame|inserta/g, "")
                    .trim();

                if (pNombre.length > 0) {
                    speak(`Te agrego un: ${pNombre}`);

                    // Aquí devolvemos también el ID
                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "ADDED_PRODUCT",
                        code: pNombre,
                        id: match.ID_PRODUCTO,
                    });

                    speak("¿Quieres algo más?");

                    return;
                }
            }
        }


    };
}

// Redirección con compatibilidad a proyectos multi-carpeta
export function redirectTo(path) {
    window.location.href = path;
}

// Función de voz para respuestas
export function speak(text) {
    const s = new SpeechSynthesisUtterance(text);
    s.lang = "es-MX";
    speechSynthesis.speak(s);
}
