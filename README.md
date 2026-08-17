# Generador de copies para @barescopados

## Qué construí
Una página web (HTML + CSS + JS, sin backend) que genera el copy de Instagram para los posteos de
@barescopados. Reemplaza la tarea manual de escribir el texto de cada publicación: cargo el nombre
del lugar, el speech que grabé en el video, el menú y algunos datos, y un agente de IA (Gemini)
redacta el copy siguiendo siempre la misma estructura y estilo que ya usamos en la cuenta. Es de uso
compartido: la usamos tanto Lucho como yo, cada uno con su propia clave gratuita de Gemini, desde el
celular.

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
   armo el copy en base a eso; los datos de entrada son nombre del lugar, el speech, y el menú (link
   o foto); la dirección y el usuario de Instagram del lugar los busco yo aparte.
6. Definí las reglas fijas: título siempre con emoji temático relacionado al lugar, un emoji distinto
   antes de cada plato/trago relacionado a esa comida puntual, máximo 5 hashtags (siempre
   #BaresCopados), "Ideal para" limitado a 4 valores posibles (citas, amigos, cumpleaños, after
   office), y que los emojis los sugiera la IA en vez de tener que elegirlos yo cada vez.

## Qué funciona
- Formulario responsive (mobile-first) con: nombre del bar, Instagram del lugar, dirección, speech,
  tres formas de cargar el menú (link, foto o texto pegado), checkboxes de "Ideal para", campo de
  API key (se guarda solo en el navegador, vía `localStorage`, nunca se sube al repo).
- Botón "Generar copy" que arma un prompt con la estructura y los 3 ejemplos reales, y llama a la
  API de Gemini (`gemini-2.0-flash`) directamente desde el navegador.
- Botón "Copiar" para pasar el resultado directo a Instagram.
- Manejo de errores visible en pantalla (si falla la clave, la conexión, o la lectura del menú).

*(Sección a completar después de probarlo con una clave real de Gemini — ver "Qué falta o qué
falló")*

## Qué falta o qué falló
- **Pendiente de prueba real**: el código está escrito pero todavía no lo probamos con una clave de
  Gemini de verdad. Falta confirmar que la llamada a la API funciona y que el copy generado respeta
  el formato.
- **Riesgo conocido en el modo "Link"**: la página no tiene servidor propio, así que no puede leer
  directamente el HTML de un sitio externo (restricción de CORS del navegador). Para sortear esto, el
  modo "Link" le pide a Gemini que use su propia herramienta de lectura de URL (`url_context`). No
  tengo 100% de certeza de que esa herramienta esté disponible en el nivel gratuito para todos los
  sitios — por eso el formulario también tiene modo "Foto" y "Texto" como alternativa garantizada.
- Falta decidir qué pasa si Gemini no encuentra info suficiente en el speech para alguna sección
  opcional (ej: postre, dato práctico) — por ahora la instrucción es que la omita en vez de inventar,
  pero falta verificarlo en la práctica.

## Qué aprendí
*(esta sección la completo yo con mi reflexión real después de probarlo)*
