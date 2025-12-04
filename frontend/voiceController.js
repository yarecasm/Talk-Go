import { obtenerCategorias } from "./services/categorias.js";

// Estado global del voice chat
export const appState = {
    action: null,
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

            speak("Oki. ¿Qué menú quieres ver?");


            shouldRestartRecognition = false;
            recognition.stop();

            appState.action = "OPEN_GUEST_ORDER";

            sendToParent({
                type: "VOICE_ACTION",
                action: "OPEN_GUEST_ORDER"
            });

            shouldRestartRecognition = true;

            return;
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
            const categorias = await obtenerCategorias();
            console.log(categorias);

            const categoriasCode = categorias.map(cat => cat.NOMBRE.toLowerCase());
            console.log(categoriasCode);
            if (categoriasCode.some(cmd => transcript.includes(cmd))) {
                // Extraer código de voz
                const cat = transcript
                    .replace(/a\s+entrar a|ve a|quiero ver|ver/g, "")
                    .trim();

                if (cat.length > 0) {
                    speak(`Vamos a: ${cat}`);

                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "OPEN_CATEGORY",
                        code: cat,
                    });

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
