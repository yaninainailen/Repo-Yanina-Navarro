// ---------- Config ----------
const MODEL = "gemini-3.6-flash"; // el "lite" (3.5-flash-lite) tenía más cuota (500/día) pero inventaba precios en vez de leer el menú real. Para este uso (pocos copies por semana), 20/día del modelo completo alcanza y es más confiable.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const STORAGE_KEY = "barescopados_gemini_key";

// Los 3 copies reales de @barescopados que definen el estilo a imitar.
const EJEMPLOS = `
🔮CASA GIN🔮
Si buscás una salida distinta, tenés que conocer @casaginarg, la gintonería más mística de Palermo. Acá los tragos llegan en vasos virales con la cara de Messi, el perrito salchicha, Maradona, Colapinto y muchos íconos más, mientras que la experiencia se completó con tarot, una ambientación súper cuidada y luces tenues que la convirtieron en un lugar ideal para una cita ❤️

Para comer fuimos con:
🧀 Provoleta con morrones confitados, cherrys y almendras ($18.500)
🐟 Trucha con vegetales asados ($31.000)
🥩 Vacío con puré de papas ahumado ($31.000)

Para tomar:
🇦🇷 "Ídolos argentinos", en vasos de Messi, Maradona o Colapinto ($15.000)
🐕 "Salchi Love", en el vaso del perrito salchicha ($17.000)
🍸 "Clover Club" ($14.000)

Y de postre…
🌋 Volcán Blanco de Pistacho ($15.000)

✍🏼 DATOS:
✅Tragos desde $13.000.
✅ Hay DJ, y en ocasiones Tarot.

☝🏼 Ideal para: parejas, amigos y cumples.

📍 Honduras 4669, Palermo.

💬 ¿Con quién irías a conocer Casa Gin?

#BaresCopados #GinTonic #Cocteleria #Foodie #Citas
---
👻𝗟𝗨𝗭𝗠𝗔𝗟𝗔👻
Conocimos @luzmalabar, un bar escondido dentro de una antigua casona y cada rincón está lleno de mística. ✨
Todo el lugar está inspirado en la famosa leyenda de la Luz Mala, esas misteriosas luces que, según cuentan, aparecían en el campo 😮

Nosotros probamos:
🍤 Langostinos rebozados ($23.800)
🍄 Bruschettas de hongos ($20.400)
🍚 Risotto con crema de hongos ($23.000)
🥩 Bondiola braseada ($33.800)
🍰 Cheesecake de frutos rojos ($13.800)

🍸 Cocktails de autor ($17.600)

✍🏼 DATOS:
✅ Conviene reservar si vas un fin de semana.
✅ Abre de miércoles a domingo de 20hs a 03hs.

☝🏼 Ideal para: citas y amigos.

📍 Arcos 2950, Nuñez.

#BaresCopados #BarOculto #Cocktails #Citas #BuenosAires
---
✨𝗜𝗟 𝗚𝗜𝗔𝗥𝗗𝗜𝗡𝗢✨
¿Sabías que existe un bar con domos en Buenos Aires?
@ilgiardinoterrazaromagnoli es uno de esos lugares ideales, incluso para el invierno: podés comer al aire libre sin pasar frío gracias a sus domos calefaccionados… ¡y hasta te dan mantitas! 🥹🧣

Nosotros probamos:
🧀 Provoleta a la brasa ($18.000)
🍄 Ñoquis con hongo porcini, trufa negra, champiñón y crema ($26.000)
🥩 T-Bone Steak con puré trufado ($65.000)

🍸 La coctelería de autor está buenísima y las pastas son una de las especialidades de la casa.

✍🏼 DATOS:
✅ Tienen un domo enorme que es ideal para cumples, reuniones y after office.
✅ También cuentan con un salón interno muy lindo.

☝🏼 Ideal para: citas, aniversarios, salidas con amigos y festejos.

📍 Posadas 1017, Recoleta.

📲 Vos, ¿con quién vendrías a comer en un domo? Etiquetalo👇

#BaresCopados #Domos #BuenosAires #Citas #Coctelería
`.trim();

const INSTRUCCIONES = `
Sos el redactor de copies de Instagram de @barescopados, una cuenta de Buenos Aires sobre bares y restaurantes.
Tu trabajo es escribir UN copy nuevo, imitando exactamente el estilo, tono y estructura de los 3 ejemplos reales que te paso abajo.

ESTRUCTURA OBLIGATORIA (en este orden):
1. Título: emoji + NOMBRE DEL LUGAR EN MAYÚSCULAS usando caracteres Unicode "Mathematical Sans-Bold" (igual que 𝗖𝗔𝗦𝗔 𝗚𝗜𝗡, 𝗟𝗨𝗭𝗠𝗔𝗟𝗔, 𝗜𝗟 𝗚𝗜𝗔𝗥𝗗𝗜𝗡𝗢) + el mismo emoji al final. El emoji lo elegís vos según la temática del lugar (ej: si es de vinos, una copa de vino; si es místico, una bola de cristal).
2. Párrafo de apertura (gancho): 1 párrafo de 3-5 líneas. Arranca con una frase de descubrimiento tipo "Conocimos...", "Si buscás...", "¿Sabías que...". Mencioná el @instagram del lugar. Contá qué lo hace único, usando la info del speech. Cerralo con un emoji.
3. Bloque de comida (si el speech/menú menciona platos): "Para comer fuimos con:" o "Nosotros probamos:" + lista de líneas "{emoji del plato} {plato} ({precio})". El emoji va antes de cada plato y tiene que ver con ESE plato puntual (ej: provoleta -> 🧀).
4. Bloque de bebida (si aplica, puede ir separado o junto al anterior): "Para tomar:" + lista igual, emoji relacionado a cada trago.
5. Postre (solo si el speech lo menciona): línea "Y de postre…" + ítem.
6. "✍🏼 DATOS:" + 1 o 2 líneas con "✅" de información práctica NUEVA, que no haya aparecido antes en el copy. Reglas estrictas de esta sección (revisalas una por una antes de escribir cada línea, son las que más se te suelen escapar):
   - PROHIBIDO usar el símbolo "$" o cualquier precio en esta sección, bajo cualquier forma ("desde $X", "tragos a partir de X"). Los precios van ÚNICAMENTE en los bloques de comida y bebida. Si el único dato que encontraste es un precio, descartalo.
   - PROHIBIDO repetir, aunque sea con otras palabras, algo que ya dijiste en el párrafo de apertura o en las listas de comida/bebida (ej: si ya contaste que hay DJ y baile en la apertura, en DATOS no vuelvas a mencionar el DJ — buscá otro dato, como el horario, o directamente omitilo).
   - Priorizá datos operativos que el lector necesita para ir y que sean REALMENTE nuevos: días y horario de apertura, si conviene reservar, qué día específico hay DJ/eventos (si no lo dijiste ya en la apertura), alguna política especial (cubierto, edad mínima).
   - Para conseguir estos datos, ADEMÁS de lo que te paso en el speech/menú, usá tu herramienta de búsqueda web para investigar el lugar (nombre + dirección + "instagram" u "horarios" son buenos términos). Si hay una cuenta de Instagram del lugar, intentá también leerla directamente.
   - Solo incluí un dato si estás razonablemente segura/o de que es correcto y actual. Si no encontrás ningún dato nuevo confiable (ni en lo que te pasé ni buscando), omitite la sección "✍🏼 DATOS:" entera — no la completes con relleno ni con algo ya dicho.
7. "☝🏼 Ideal para: " + la lista de valores que te paso (separados por coma).
8. "📍 " + la dirección tal cual te la paso.
9. Una pregunta de cierre para generar comentarios, con emoji 💬 o 📲, coherente con el lugar.
10. Hashtags: máximo 5, siempre el primero "#BaresCopados", los demás relacionados a la temática/categoría del lugar.

REGLAS DE ESTILO:
- Tono informal, cercano, en "vos" (español rioplatense).
- No inventes platos ni precios que no estén en el speech o el menú (link/foto/texto). Los precios SOLO pueden aparecer en los bloques de comida y bebida, nunca en DATOS.
- Si falta información para una sección opcional (postre, DATOS), omitila en vez de inventar.
- Devolvé SOLO el texto final del copy, listo para pegar en Instagram. Sin explicaciones, sin comillas, sin bloques de código.

EJEMPLOS REALES DE @barescopados (para que copies el estilo, NO el contenido):
${EJEMPLOS}
`.trim();

// ---------- Estado de la clave ----------
const apiKeyInput = document.getElementById("apiKey");
const rememberKey = document.getElementById("rememberKey");

const savedKey = localStorage.getItem(STORAGE_KEY);
if (savedKey) apiKeyInput.value = savedKey;

apiKeyInput.addEventListener("input", () => {
  if (rememberKey.checked) {
    localStorage.setItem(STORAGE_KEY, apiKeyInput.value);
  }
});

rememberKey.addEventListener("change", () => {
  if (!rememberKey.checked) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, apiKeyInput.value);
});

// ---------- Tabs de menú ----------
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.mode;
    tabPanels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.panel !== mode);
    });
  });
});

function menuModeActivo() {
  return document.querySelector(".tab-btn.active").dataset.mode;
}

// ---------- Helpers ----------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const [, base64] = reader.result.split(",");
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function datosFormulario() {
  const idealPara = Array.from(
    document.querySelectorAll('input[name="idealPara"]:checked')
  ).map((el) => el.value);

  return {
    nombreBar: document.getElementById("nombreBar").value.trim(),
    instagramLugar: document.getElementById("instagramLugar").value.trim(),
    direccion: document.getElementById("direccion").value.trim(),
    speech: document.getElementById("speech").value.trim(),
    idealPara,
    menuModo: menuModeActivo(),
    menuLink: document.getElementById("menuLink").value.trim(),
    menuTexto: document.getElementById("menuTexto").value.trim(),
    menuFotoFile: document.getElementById("menuFoto").files[0] || null,
  };
}

async function construirContenidoUsuario(datos) {
  let datosTexto = `
Nombre del lugar: ${datos.nombreBar}
Instagram del lugar: ${datos.instagramLugar || "(no especificado)"}
Dirección: ${datos.direccion || "(no especificada)"}
Ideal para: ${datos.idealPara.length ? datos.idealPara.join(", ") : "(no especificado)"}

Speech del video (fuente principal de info y anécdotas):
${datos.speech}
`.trim();

  const igUrl = instagramUrlDesdeHandle(datos.instagramLugar);
  if (igUrl) {
    datosTexto += `\n\nPara la sección DATOS, investigá información complementaria (horarios, días de apertura, DJ/eventos) buscando en la web y, si podés leerlo, en ${igUrl}. Solo usalo si estás segura/o de que el dato es correcto.`;
  }

  const parts = [];

  if (datos.menuModo === "texto") {
    datosTexto += `\n\nMenú y precios (pegados a mano):\n${datos.menuTexto}`;
    parts.push({ text: datosTexto });
  } else if (datos.menuModo === "foto" && datos.menuFotoFile) {
    const base64 = await fileToBase64(datos.menuFotoFile);
    datosTexto += `\n\nEl menú con los precios está en la imagen adjunta. Extraé de ahí los platos/tragos relevantes que coincidan con lo mencionado en el speech.`;
    parts.push({ text: datosTexto });
    parts.push({
      inline_data: {
        mime_type: datos.menuFotoFile.type || "image/jpeg",
        data: base64,
      },
    });
  } else if (datos.menuModo === "link" && datos.menuLink) {
    datosTexto += `\n\nEl menú con los precios está en este link: ${datos.menuLink}\nUsá la herramienta de lectura de URL para extraer platos/tragos y precios que coincidan con lo mencionado en el speech.`;
    parts.push({ text: datosTexto });
  } else {
    parts.push({ text: datosTexto });
  }

  return parts;
}

function instagramUrlDesdeHandle(handle) {
  if (!handle) return null;
  const limpio = handle.replace("@", "").trim();
  if (!limpio) return null;
  return `https://www.instagram.com/${limpio}/`;
}

// ---------- Llamada a Gemini ----------
function esErrorDeCuota(err) {
  return /quota|rate.?limit|429|RESOURCE_EXHAUSTED/i.test(err.message);
}

// Cuando Gemini devuelve una respuesta "vacía" (sin texto), casi siempre es por un motivo
// puntual (filtro de seguridad, se cortó por longitud, etc.) que viene en la propia respuesta.
// Lo mostramos directo en pantalla en vez de mandar a "revisar la consola" -- que ni existe
// en el navegador del celular.
const MOTIVOS_FINISH_REASON = {
  SAFETY: "El contenido fue bloqueado por los filtros de seguridad de Gemini (puede pasar con ciertas combinaciones de palabras en el speech o el nombre del lugar). Probá reformular el speech.",
  RECITATION: "Gemini detectó que la respuesta se parecía demasiado a un texto existente y la bloqueó. Probá reformular el speech con tus palabras.",
  MAX_TOKENS: "La respuesta se cortó por longitud antes de generar texto. Probá con un speech o menú más corto.",
  OTHER: "Gemini no pudo completar la respuesta por un motivo no especificado.",
  PROHIBITED_CONTENT: "El contenido fue bloqueado por las políticas de Gemini.",
};

function explicarRespuestaVacia(data) {
  const bloqueoPrompt = data?.promptFeedback?.blockReason;
  if (bloqueoPrompt) {
    return `El pedido en sí fue bloqueado por Gemini (motivo: ${bloqueoPrompt}). Probá reformular el speech o los datos del lugar.`;
  }

  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    return MOTIVOS_FINISH_REASON[finishReason] || `Motivo reportado por Gemini: ${finishReason}.`;
  }

  return "No se pudo determinar el motivo exacto. Probá de nuevo -- si se repite con los mismos datos, puede ser un problema temporal de Gemini.";
}

async function llamarGemini(userParts, tools, apiKey) {
  const body = {
    system_instruction: {
      parts: [{ text: INSTRUCCIONES }],
    },
    contents: [
      {
        role: "user",
        parts: userParts,
      },
    ],
    generationConfig: {
      temperature: 0.8,
    },
  };

  if (tools.length) body.tools = tools;

  const res = await fetch(`${API_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    let msg = data?.error?.message || `Error HTTP ${res.status}`;
    // Si Google nos manda el detalle de qué cuota puntual se agotó (por día,
    // por minuto, de qué feature), lo mostramos: así diagnosticamos con datos
    // reales en vez de adivinar.
    const violaciones = data?.error?.details
      ?.find((d) => d["@type"]?.includes("QuotaFailure"))
      ?.violations?.map((v) => v.quotaId || v.quotaMetric)
      .filter(Boolean);
    if (violaciones?.length) msg += `\n(Cuota específica agotada: ${violaciones.join(", ")})`;
    throw new Error(msg);
  }

  const texto = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!texto) {
    throw new Error(`Gemini respondió pero sin texto generado. ${explicarRespuestaVacia(data)}`);
  }

  return { texto: texto.trim(), groundingMetadata: data?.candidates?.[0]?.groundingMetadata };
}

// google_search: para que investigue datos extra del lugar (horarios, DJ, etc.)
//   por fuera de lo que cargamos en el formulario.
// url_context: para leer directamente el link del menú y/o el Instagram del lugar
//   (el navegador no puede leer sitios externos por CORS, así que se lo delegamos
//   a Gemini). Instagram en particular puede bloquear esta lectura -- si eso pasa,
//   el modelo simplemente no va a tener ese dato y lo va a omitir.
//
// Si la cuota gratuita de "buscar/leer" (grounding) está agotada, reintentamos
// UNA sola vez sin esas herramientas (no más, para no derrochar la cuota general
// del modelo si el problema es otro). Si ese segundo intento también falla por
// cuota, es que el límite es del modelo entero, no de la búsqueda -- y ahí no
// tiene sentido seguir reintentando.
async function generarCopy(datos, apiKey) {
  const userParts = await construirContenidoUsuario(datos);

  const necesitaUrlContext =
    (datos.menuModo === "link" && datos.menuLink) || instagramUrlDesdeHandle(datos.instagramLugar);

  const toolsConTodo = necesitaUrlContext
    ? [{ url_context: {} }, { google_search: {} }]
    : [{ google_search: {} }];

  try {
    const { texto, groundingMetadata } = await llamarGemini(userParts, toolsConTodo, apiKey);
    return { texto, fuentes: extraerFuentes(groundingMetadata) };
  } catch (err) {
    if (!esErrorDeCuota(err)) throw err;

    const { texto, groundingMetadata } = await llamarGemini(userParts, [], apiKey);
    const fuentes = `⚠️ Se quedó sin cuota gratuita para buscar/leer en la web y generó este copy sin esa parte.\n\n${extraerFuentes(groundingMetadata)}`;
    return { texto, fuentes };
  }
}

function extraerFuentes(groundingMetadata) {
  if (!groundingMetadata) return "El modelo no reporta haber buscado ni leído nada por fuera de lo que le pasaste.";

  const lineas = [];

  const queries = groundingMetadata.webSearchQueries || [];
  if (queries.length) {
    lineas.push(`Búsquedas web: ${queries.join(" | ")}`);
  }

  const chunks = groundingMetadata.groundingChunks || [];
  const urls = chunks
    .map((c) => c.web?.uri || c.retrievedUrl || c.maps?.uri)
    .filter(Boolean);
  if (urls.length) {
    lineas.push("Fuentes leídas:\n" + urls.map((u) => `- ${u}`).join("\n"));
  }

  return lineas.length ? lineas.join("\n\n") : "El modelo tenía las herramientas activadas pero no reporta haberlas usado esta vez.";
}

// ---------- UI: submit ----------
const form = document.getElementById("copyForm");
const generarBtn = document.getElementById("generarBtn");
const resultCard = document.getElementById("resultCard");
const loading = document.getElementById("loading");
const resultado = document.getElementById("resultado");
const copiarBtn = document.getElementById("copiarBtn");
const copiadoMsg = document.getElementById("copiadoMsg");
const errorCard = document.getElementById("errorCard");
const errorMsg = document.getElementById("errorMsg");
const fuentesToggleWrap = document.getElementById("fuentesToggleWrap");
const fuentesToggle = document.getElementById("fuentesToggle");
const fuentesDiv = document.getElementById("fuentes");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorCard.classList.add("hidden");

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    mostrarError("Falta la API key de Gemini. Conseguila gratis en aistudio.google.com y pegala arriba.");
    return;
  }

  const datos = datosFormulario();
  if (!datos.nombreBar || !datos.speech) {
    mostrarError("Completá al menos el nombre del bar y el speech del video.");
    return;
  }

  resultCard.classList.remove("hidden");
  loading.classList.remove("hidden");
  resultado.value = "";
  copiadoMsg.classList.add("hidden");
  fuentesToggleWrap.classList.add("hidden");
  fuentesDiv.classList.add("hidden");
  generarBtn.disabled = true;
  generarBtn.textContent = "Generando...";

  try {
    const { texto, fuentes } = await generarCopy(datos, apiKey);
    resultado.value = texto;
    fuentesDiv.textContent = fuentes;
    fuentesToggleWrap.classList.remove("hidden");
  } catch (err) {
    mostrarError(`No se pudo generar el copy.\n\nDetalle: ${err.message}\n\nSi cargaste el menú como link y el error menciona la URL, probá con la pestaña "Foto" o "Texto" en su lugar.`);
    resultCard.classList.add("hidden");
  } finally {
    loading.classList.add("hidden");
    generarBtn.disabled = false;
    generarBtn.textContent = "✨ Generar copy";
  }
});

fuentesToggle.addEventListener("click", () => {
  fuentesDiv.classList.toggle("hidden");
});

copiarBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultado.value);
  copiadoMsg.classList.remove("hidden");
  setTimeout(() => copiadoMsg.classList.add("hidden"), 2000);
});

function mostrarError(msg) {
  errorMsg.textContent = msg;
  errorCard.classList.remove("hidden");
  errorCard.scrollIntoView({ behavior: "smooth", block: "center" });
}
