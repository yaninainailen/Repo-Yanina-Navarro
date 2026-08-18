# Generador de copies para @barescopados

**Página funcionando:** https://yaninainailen.github.io/Repo-Yanina-Navarro/
**Código fuente:** los archivos `index.html`, `style.css` y `script.js` en la raíz de este repo.

⚠️ Para probar el botón "Generar copy" hace falta pegar una **clave gratuita propia de Gemini**
(no la mía) — se consigue en 1 minuto en [aistudio.google.com](https://aistudio.google.com), sin
tarjeta. Sin clave, el formulario carga y se ve bien, pero el botón va a mostrar un error pidiéndola.

## Qué construí
Una página web (HTML + CSS + JS, sin backend) que genera el copy de Instagram para los posteos de
@barescopados. Reemplaza la tarea manual de escribir el texto de cada publicación: cargo el nombre
del lugar, el speech que grabé en el video, el menú y algunos datos, y un agente de IA (Gemini)
redacta el copy siguiendo siempre la misma estructura y estilo que ya usamos en la cuenta, incluso
buscando en la web datos prácticos (horarios, DJ) que no le pasé a mano. Es de uso compartido: la
usamos tanto Lucho como yo, cada uno con su propia clave gratuita de Gemini, desde el celular.

## Cómo se lo pedí
Instrucciones principales, en el orden en que se las di al agente (Claude Code):

1. *"Tengo el instagram @barescopados y hago una tarea manual que es la de generar el Copy... quiero
   automatizar. La estructura del copy siempre es la misma... quiero enseñarte exactamente como lo
   hago para que podamos crear en un html una página donde yo inserte algunos datos y con un botón
   de generar me dejes listo el copy... debería ser responsive para que pueda entrar desde el celular...
   mi novio tiene que poder acceder y usarlo también ya que la cuenta es de ambos."*
2. Decisión de arquitectura: pedí que el copy lo genere una IA real (no una plantilla mecánica sin
   IA), para que sea un agente de IA de verdad y no solo un armador de texto.
3. Decisión de costos: descarté usar la API de Claude porque implicaba pagar aparte de mi
   suscripción, y elegí la API de Gemini por su nivel gratuito sin tarjeta.
4. Le pasé al agente 3 copies reales ya publicados en la cuenta, para que aprendiera el estilo y la
   estructura exacta (título con emoji + nombre en mayúscula/negrita, bloque de comida, bloque de
   bebida, "✍🏼 DATOS", "☝🏼 Ideal para", dirección, pregunta de cierre, hashtags).
5. Le expliqué el proceso manual real: primero grabo el video y el speech (guion hablado), después
   armo el copy en base a eso; los datos de entrada son nombre del lugar, el speech, y el menú (link,
   foto o texto); la dirección y el usuario de Instagram del lugar los busco yo aparte.
6. Definí las reglas fijas: título siempre con emoji temático relacionado al lugar, un emoji distinto
   antes de cada plato/trago relacionado a esa comida puntual, máximo 5 hashtags (siempre
   #BaresCopados), "Ideal para" limitado a 4 valores posibles (citas, amigos, cumpleaños, after
   office), y que los emojis los sugiera la IA en vez de tener que elegirlos yo cada vez. Para el
   menú pedí poder cargarlo por link o por foto.
7. Después de probarlo con un lugar real (Misión), pedí dos correcciones puntuales: que la sección
   "DATOS" no repita precios ni ideas ya dichas antes en el copy, y que el agente pueda buscar por su
   cuenta información extra del lugar (horarios, DJs) más allá de lo que yo le paso, tal como yo lo
   busco a mano hoy.

## Qué funciona
- Formulario responsive (mobile-first) con: nombre del bar, Instagram del lugar, dirección, speech,
  tres formas de cargar el menú (link, foto o texto pegado), checkboxes de "Ideal para", campo de
  API key (se guarda solo en el navegador, vía `localStorage`, nunca se sube al repo).
- Botón "Generar copy" que arma un prompt con la estructura y los 3 ejemplos reales, y llama a la
  API de Gemini directamente desde el navegador.
- **Modo Link probado con un caso real** (@mision.ba): el agente leyó el menú desde la web del lugar
  (herramienta `url_context` de Gemini) y armó un copy respetando la estructura, con emojis
  coherentes por plato y por temática del lugar.
- Búsqueda web (`google_search`) activada para que la sección DATOS incluya información que no le
  pasé a mano (horarios, eventos), con instrucción explícita de no inventar si no encuentra nada
  confiable.
- Botón "Copiar" para pasar el resultado directo a Instagram.
- Panel "Ver qué buscó/leyó el agente": muestra qué búsquedas hizo y qué fuentes leyó, para poder
  auditar si la IA realmente investigó o se quedó con lo que le pasé.
- Manejo de errores visible en pantalla, con degradación automática: si se queda sin cuota para
  buscar/leer, reintenta sin esas herramientas en vez de romperse.

## Qué falta o qué falló
- **La sección DATOS repetía precios y contenido**: en la primera prueba real, "DATOS" volvía a poner
  un precio de los tragos y repetía la idea del DJ que ya estaba en la apertura. Ajusté el prompt con
  reglas explícitas ("prohibido el símbolo $ en DATOS", "prohibido repetir ideas ya dichas") y un
  criterio claro de cuándo omitir la sección en vez de rellenarla. Quedó mejor pero no llegué a hacer
  una tercera prueba end-to-end por el problema de cuota (ver siguiente punto) — para la próxima
  entrega habría que confirmar que la corrección sostiene en varios casos distintos, no solo uno.
- **Choqué con el límite de cuota gratuita de Gemini, y la causa no era la que pensé**: al principio
  asumí que era la cuota de "búsqueda web" (google_search/url_context), porque son herramientas más
  caras. Armé una lógica de reintento sin esas herramientas cuando fallaba por cuota. Pero el error
  persistía igual sin herramientas, así que fui a revisar el panel de uso real de Google AI Studio
  (aistudio.google.com/rate-limit) en vez de seguir adivinando — ahí vi que el límite real era otro:
  el modelo `gemini-3.6-flash` tiene apenas **20 solicitudes por día** en el nivel gratuito (lo gasté
  entero probando), mientras que la búsqueda web tiene 2.000/día y no era el problema.
- **Probé cambiar a un modelo "lite" con más cuota, y empeoró la calidad**: cambié a
  `gemini-3.5-flash-lite` (500 solicitudes/día en vez de 20) para no volver a quedarme sin cuota. Al
  probarlo con el mismo lugar real, los precios del menú salieron **inventados** — el modelo más
  chico no leyó bien el link del menú (o lo ignoró) y completó con precios inventados en vez de los
  reales. Volví a `gemini-3.6-flash`: para este uso (unos pocos copies por semana, no cientos por
  día) 20 solicitudes diarias alcanzan de sobra, y la precisión de los precios importa mucho más que
  el volumen de cuota — un precio mal publicado es un error real frente a los seguidores.
  **Aprendizaje concreto**: "más cuota gratis" y "mismo modelo" no son intercambiables; hay que
  probar con un caso real antes de asumir que un modelo más chico sirve igual.
- El modelo `gemini-2.0-flash` (mi elección inicial) ya estaba discontinuado y ni siquiera llegué a
  probarlo — la propia API me devolvió el nombre del reemplazo (`gemini-3.6-flash`) en el mensaje de
  error, que fue el que después chocó con el límite de 20/día.
- Nunca probé el modo "Foto" del menú (subir una imagen para que Gemini la lea) con un caso real —
  quedó implementado pero sin validar.
- No hay ningún control de que el copy generado realmente respete el máximo de 5 hashtags o el
  formato exacto de "Ideal para" — depende de que el modelo siga bien la instrucción, no hay
  validación de código que lo fuerce. Sería una mejora natural para la próxima vuelta.
- **Última prueba del día**: al volver a `gemini-3.6-flash` (el que sí leía bien los precios), Gemini
  devolvió el error *"This model is currently experiencing high demand"* — un problema de
  disponibilidad del lado de Google, no de mi código ni de mi cuota. Entrego con este error sin
  resolver: no depende de mí, y confirma otra cosa que aprendí hoy — cuando se depende de una API
  externa gratuita, una parte de la confiabilidad del producto queda fuera de tu control.
- Encontré (y evité subir a tiempo) un archivo con mi API key sueltro en la carpeta del proyecto —
  quedó afuera del repo gracias a un `.gitignore`, pero es una prueba de lo fácil que es cometer ese
  error si uno no está prestando atención.

## Qué aprendí
