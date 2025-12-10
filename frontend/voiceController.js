import { obtenerCategorias } from "./services/categorias.js";
import { obtenerProductosPorCategoria } from "./services/productos.js";
import { verificarUsuario } from "./services/usuarios.js";
import { findSimilar } from "./utils/similarity.js";


// Estado global del voice chat
export let appState = {
    action: null,
    actualCategory: null,
    initialVoice: true,
};

// Intentar cargar estado guardado
const storedState = localStorage.getItem("voice_app_state");
if (storedState) {
    appState = JSON.parse(storedState);
}


function saveAppState() {
    localStorage.setItem("voice_app_state", JSON.stringify(appState));
}


let shouldRestartRecognition = true;
let recognition = null;
let isVoiceActive = true;

window.addEventListener("DOMContentLoaded", () => {
    if (appState.initialVoice && appState.action == null) {
        speak("Hola, soy un asistente de voz hecho para ayudarte, si quieres apagarme, di, apagate, sino, dime, ¿cómo quieres iniciar? ");
        appState.initialVoice = false;
        saveAppState();
    }
});

// Iniciar reconocimiento de voz
export function initVoiceCommands(sendToParent) {
    if (isVoiceActive) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Tu navegador no soporta SpeechRecognition");
            return;
        }

        console.log("ACTUAL STATE: ", appState.action);

        recognition = new SpeechRecognition();
        recognition.lang = "es-MX";
        recognition.continuous = false;
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
                console.log(error);
            }
        };


        // ÚNICO onresult (fusionado)
        recognition.onresult = async (event) => {

            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log("Dijiste:", transcript);

            // APAGAR VOZ
            if (transcript.includes("apágate") || transcript.includes("apagar") || transcript.includes("apagate")) {
                speak("Hasta luego.");
                isVoiceActive = false;
                shouldRestartRecognition = false;
                return;
            }

            // ELIMINAR UN PRODUCTO
            if (transcript.includes("borra") || transcript.includes("elimina") || transcript.includes("quita") || transcript.includes("quitar")
                || transcript.includes("borrar") || transcript.includes("eliminar")) {
                const cart = JSON.parse(localStorage.getItem('cart')) || {};
                const numberOfKeys = Object.keys(cart).length;

                console.log("Intentando borrar...");

                if (numberOfKeys > 0) {
                    console.log("Obteniendo coincidencias...");
                    const productos = await obtenerProductosPorCategoria(appState.actualCategory);
                    const newTranscription = transcript
                        .replace(/\s+borrar|eliminar|borra|elimina|quitar|quita|borra un|elimina un| quita un/g, "")
                        .trim();

                    const nombres = productos.map(p => p.NOMBRE.toLowerCase());
                    console.log(newTranscription);
                    const result = findSimilar(newTranscription, nombres, 0.7);
                    console.log(result);

                    if (result) {
                        const match = productos.find(p => p.NOMBRE.toLowerCase() === result.match.toLowerCase());

                        speak(`Borrando un: ${match.NOMBRE}`);

                        sendToParent({
                            type: "VOICE_ACTION",
                            action: "DELETE_PRODUCT",
                            code: match.NOMBRE,
                            id: match.ID_PRODUCTO,
                        });

                        speak("¿Quieres ir a otra categoría o agregar un nuevo producto?");
                        appState.action = "WAITING-TO-NAV";
                        saveAppState();

                        return;
                    } else {
                        return;
                    }
                }
                return;
            }

            if (transcript.includes("pagar") || transcript.includes("finalizar") || transcript.includes("es todo")
                || transcript.includes("enviar") || transcript.includes("terminar")) {
                const cart = JSON.stringify(localStorage.getItem('cart')) || {};

                if (Object.keys(cart).length > 0) {
                    speak("Okay, procesaré tu orden, pasa a recogerla.");
                    appState.action = "FINISH_ORDER";
                    saveAppState();

                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "FINISH_ORDER"
                    });

                    return;
                }
                return;
            }

            // CANCELAR ORDEN
            if (transcript.includes("cancelar orden") || transcript.includes("cancela todo") || transcript.includes("borrar orden")) {
                speak("Tu orden será borrada");

                isVoiceActive = false;
                shouldRestartRecognition = false;

                sendToParent({
                    type: "VOICE_ACTION",
                    action: "CANCEL_ALL"
                });

                appState = {
                    action: null,
                    actualCategory: null,
                    initialVoice: true,
                };
                saveAppState();

                return;
            }

            //shouldRestartRecognition = false;

            // --- COMANDOS GLOBALES ---
            const memberCode = ["miembro", "iniciar miembro", "como miembro", "iniciar como miembro"];
            if (memberCode.some(cmd => transcript.includes(cmd))) {

                speak("Claro, ¿Cuál es tu usuario?.");
                appState.action = "OPEN_MEMBER_LOGIN";
                saveAppState();

                sendToParent({
                    type: "VOICE_ACTION",
                    action: "OPEN_MEMBER_LOGIN"
                });

                return;
            }

            const notMemberCode = [
                "no iniciar", "no soy miembro", "no miembro",
                "iniciar", "ordena", "order", "invitado",
            ];
            if (notMemberCode.some(cmd => transcript.includes(cmd))) {

                speak("¿Qué menú quieres ver?");

                appState.action = "OPEN_GUEST_ORDER";
                saveAppState();

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
                    saveAppState();

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
                    shouldRestartRecognition = false;

                    // VERIFICAR USUARIO
                    const usuario = await verificarUsuario(code);

                    if (!usuario) {
                        appState.action = "INVALID_USER";
                        saveAppState();
                        speak("Usuario invalido");
                        sendToParent({
                            type: "VOICE_ACTION",
                            action: "OPEN_MEMBER_LOGIN"
                        });
                        return;
                    }
                    else {
                        // Si existe → guardarlo y mandar a categorías
                        localStorage.setItem("usuarioId", usuario.ID_USUARIO);
                        localStorage.setItem("usuarioTipo", usuario.TIPO_USUARIO);
                        localStorage.setItem("usuarioNombre", usuario.NOMBRE);

                        console.log("ID válido, entrando como miembro:", usuario.ID_USUARIO);

                        appState.action = "MAIN-MEMBER";
                        saveAppState();

                        sendToParent({
                            type: "VOICE_ACTION",
                            action: "SET_MEMBER_CODE",
                            code: code,
                            isValid: usuario,
                        });
                    }
                    return;
                }
            }
            if (appState.action === "INVALID_USER") {
                speak("Intenta de nuevo");
                appState.action = "OPEN_MEMBER_LOGIN";
                saveAppState();
                return;
            }

            // -- Elegir rewards o categorías --
            if (appState.action === "MAIN-MEMBER") {
                speak("¿Qué quieres hacer?");
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
                        saveAppState();

                        // Aquí devolvemos también el ID
                        sendToParent({
                            type: "VOICE_ACTION",
                            action: "OPEN_CATEGORY",
                            code: catNombre,
                            id: match.ID_CATEGORIA,
                        });

                        return;

                        // speak("Dime el nombre de un producto, lo añadiré por ti al carrito");

                    }
                }
                else {
                    if (transcript.includes("premios") || transcript.includes("descuentos")
                        || transcript.includes("rewards") || transcript.includes("premio") || transcript.includes("punto")
                        || transcript.includes("puntos") || transcript.includes("promos") || transcript.includes("promociones")) {
                        speak("De acuerdo.");
                        appState.action = "MEMBER_POINTS";
                        saveAppState();

                        sendToParent({
                            type: "VOICE_ACTION",
                            action: "MEMBER_POINTS"
                        });

                        return;
                    }
                }
            }

            // --- MODO INVITADO ---
            // ELEGIR CATEGORÍA
            if (appState.action === "OPEN_GUEST_ORDER") {

                const categorias = await obtenerCategorias();

                // Lista de nombres de categorías
                const nombresCategorias = categorias.map(c => c.NOMBRE.toLowerCase());

                // Buscar coincidencia por similitud
                const result = findSimilar(transcript.toLowerCase(), nombresCategorias, 0.6);
                // console.log("Match de categoría:", result);

                if (result) {
                    const match = categorias.find(
                        c => c.NOMBRE.toLowerCase() === result.match.toLowerCase()
                    );

                    speak(`Abriendo categoría: ${match.NOMBRE}. Dime un producto para agregar.`);

                    // Notificar al padre
                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "OPEN_CATEGORY",
                        code: match.NOMBRE,
                        id: match.ID_CATEGORIA,
                    });

                    appState.actualCategory = match.ID_CATEGORIA;
                    appState.action = "OPEN_CATEGORY";
                    saveAppState();

                    return;
                }

                // No hubo coincidencia
                return;
            }


            // NAVEGACION MENU
            if (appState.action === "NAV") {

                // RESPUESTA : SI QUIERO ALGO MAS 
                if (transcript.includes("si") || transcript.includes("yes") || transcript.includes("claro") || transcript.includes("por supuesto")) {
                    speak("¿Quieres ir a otra categoría o agregar un nuevo producto?");
                    appState.action = "WAITING-TO-NAV";
                    saveAppState();

                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "WAITING-TO-NAV"
                    });

                    return;
                }
                if (transcript.includes("no") || transcript.includes("es todo") || transcript.includes("todo") || transcript.includes("terminar")) {
                    speak("Okay, procesaré tu orden, pasa a recogerla.");
                    appState.action = "FINISH_ORDER";
                    saveAppState();

                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "FINISH_ORDER"
                    });

                    return;
                }

            };
            // SELECCIONAR ENTRE CAMBIAR CATEGORÍA O AGREGAR PRODUCTO
            if (appState.action == "WAITING-TO-NAV") {
                if (transcript.includes("cambiar") || transcript.includes("cambiar de categoría") || transcript.includes("cambiar de categoria")) {
                    speak("¿Qué menú quieres ver?");

                    appState.action = "OPEN_GUEST_ORDER";
                    saveAppState();

                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "OPEN_GUEST_ORDER"
                    });

                    return;
                }
                else {
                    if (transcript.includes("agregar producto") || transcript.includes("agregar un producto")) {
                        speak("¿Qué te agrego?");

                        appState.action = "OPEN_CATEGORY";
                        saveAppState();

                        return;
                    }
                }


            }

            // AGREGAR PRODUCTOS 
            if (appState.action === "OPEN_CATEGORY") {

                const productos = await obtenerProductosPorCategoria(appState.actualCategory);
                const nombres = productos.map(p => p.NOMBRE);

                console.log("transcription: ", transcript);
                if (transcript == "") return;

                const result = findSimilar(transcript, nombres, 0.6);

                if (result) {
                    const match = productos.find(p => p.NOMBRE.toLowerCase() == result.match.toLowerCase());

                    speak(`Te agrego un: ${match.NOMBRE}`);

                    sendToParent({
                        type: "VOICE_ACTION",
                        action: "ADDED_PRODUCT",
                        code: match.NOMBRE,
                        id: match.ID_PRODUCTO,
                    });

                    speak("¿Quieres algo más?");
                    appState.action = "NAV";
                    saveAppState();
                    return;
                } else {
                    speak("No te entendí, repítelo");
                    return;
                }
            }

            // PAY
            if (appState.action === "FINISH_ORDER") {
                sendToParent({
                    type: "VOICE_ACTION",
                    action: "FINISH_ORDER"
                });

            };
        }

    }
}

// Redirección con compatibilidad a proyectos multi-carpeta
export function redirectTo(path) {
    window.location.href = path;
}

// Función de voz para respuestas
export function speak(text) {
    if (isVoiceActive) {
        shouldRestartRecognition = false;

        console.log("Sección acual: ", appState.action);
        console.log("Intentado hablar...");
        if (recognition) {
            try { recognition.stop(); } catch (e) { console.log(e); }
        }

        const s = new SpeechSynthesisUtterance(text);
        s.lang = "es-MX";
        s.rate = 1.7;

        s.onstart = () => {
            console.log("Asistente hablando...");
            console.log(s);
        };

        s.onend = () => {
            if (!isVoiceActive) {
                shouldRestartRecognition = false;
                recognition.stop();
            }
            else {
                console.log("Asistenté terminó de hablar. Activando micrófono...");
                shouldRestartRecognition = true;
                recognition.start()
            }

        };

        speechSynthesis.speak(s);
    }
}
