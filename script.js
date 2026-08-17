// ---------- Config ----------
const MODEL = "gemini-3.6-flash";
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
6. "✍🏼 DATOS:" + 1 o 2 líneas con "✅" de información práctica destacable (precio desde, si hay que reservar, horarios, algo distintivo). Usá lo que haya en el speech; si no hay dato práctico claro, no inventes uno.
7. "☝🏼 Ideal para: " + la lista de valores que te paso (separados por coma).
8. "📍 " + la dirección tal cual te la paso.
9. Una pregunta de cierre para generar comentarios, con emoji 💬 o 📲, coherente con el lugar.
10. Hashtags: máximo 5, siempre el primero "#BaresCopados", los demás relacionados a la temática/categoría del lugar.

REGLAS DE ESTILO:
- Tono informal, cercano, en "vos" (español rioplatense).
- No inventes platos, precios ni datos que no estén en el speech, el menú o los datos cargados.
- Si falta información para una sección opcional (postre, dato práctico), omitila en vez de inventar.
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

// ---------- Llamada a Gemini ----------
async function generarCopy(datos, apiKey) {
  const userParts = await construirContenidoUsuario(datos);

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

  // Solo agregamos la herramienta de lectura de URL cuando el menú viene por link,
  // porque el navegador no puede leer sitios externos directamente (CORS).
  if (datos.menuModo === "link" && datos.menuLink) {
    body.tools = [{ url_context: {} }];
  }

  const res = await fetch(`${API_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  const texto = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!texto) {
    throw new Error("Gemini respondió pero sin texto generado. Revisá la consola del navegador (F12) para más detalle.");
  }

  return texto.trim();
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
  generarBtn.disabled = true;
  generarBtn.textContent = "Generando...";

  try {
    const copy = await generarCopy(datos, apiKey);
    resultado.value = copy;
  } catch (err) {
    mostrarError(`No se pudo generar el copy.\n\nDetalle: ${err.message}\n\nSi cargaste el menú como link y el error menciona la URL, probá con la pestaña "Foto" o "Texto" en su lugar.`);
    resultCard.classList.add("hidden");
  } finally {
    loading.classList.add("hidden");
    generarBtn.disabled = false;
    generarBtn.textContent = "✨ Generar copy";
  }
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
