# Teaser del juego

Un video corto de World of Argentum (unos 50 segundos, 1920 × 1080) grabado con el juego real. Se hace igual que el teaser de game-space: un guion de Playwright juega el recorrido sin HUD, guarda los cuadros y el momento en que arranca cada escena, y otro script arma el video con carteles, música y los sonidos del juego.

Para que el mundo se vea con gente, el server pone bots con nombres de jugador que caminan, charlan, meditan, cazan y asedian un castillo. Esos bots existen solo en la grabación.

El recorrido:

1. **Nix**: gente alrededor de la fuente, charlando y meditando.
2. **Caza**: una party (guerrero, paladín, mago y arquero) contra orcos en el bosque del mapa 54.
3. **La clase nueva**: el Chamán elemental tira Ventisca, Llamarada, Incinerar y Rayo Eléctrico contra lobos árticos y osos polares, de noche en la nieve (mapa 89).
4. **Castillo**: el clan Los Inmortales entra a la sala del trono del Castillo Norte y pelea con el rey y con la Guardia de Plata, con tormenta.
5. **Al final, la mazmorra nueva** (la de prueba, con el arte de la Gruta del Abisal), con el cartel "Próximamente · En desarrollo".
6. El logo, la dirección del sitio y el crédito de la música.

![Nix](../docs/teaser/01-nix.jpg)

## Cómo se graba

Necesita el stack local levantado: Postgres, la API (3001), el server de juego (7666) y el frontend en el 3010. También necesita Chrome instalado y ffmpeg con libx264.

```bash
cd teaser
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install   # usa el Chrome de la máquina
pnpm grabar     # 1 minuto y medio; TEASER_MOSTRAR=1 para ver la ventana
pnpm editar     # 1 minuto; deja out/world-of-argentum-teaser.mp4
```

La primera vez, `grabar` crea la cuenta `teaser` y el personaje Nahuel, un chamán. Al entrar a cada escena, el server lo pasa a nivel 50 con el equipo y los hechizos del chamán de la arena. Todo lo que genera (cuadros, marcas, sonidos y el video) queda en `teaser/out/`, que no se sube.

## Cómo funciona

- **Las escenas y los bots** están en `server/src/teaser.ts`. Cada escena dice a qué lugar va el que graba, qué bots pone (clase, lugar, qué hacen y qué dicen), qué criaturas aparecen y a qué hora y con qué clima se ve. Los bots entran con la plantilla de su clase de la arena y mandan los mismos paquetes que un cliente: girar, golpear, hechizos y chat. El server los valida igual que a cualquiera.
- **Los endpoints** `/debug/teaser/escena`, `estado`, `decir`, `ir` y `limpiar` solo existen fuera de producción (`server.ts`). `ir` sirve para buscar lugares nuevos.
- **El modo grabación** está en `frontend/lib/teaserRecording.ts`. Se prende con `woao.grabacion` en sessionStorage y solo funciona en desarrollo. El render tapa toda la ventana en escala 2 exacta y se esconde todo lo demás. Además anota cada sonido que suena y deja tirar hechizos y hablar sin la interfaz (`window.__woaoTeaser`).
- **`grabar.ts`** juega el recorrido y graba la pantalla con la transmisión de pantalla de Chrome: los cuadros son de 1600 × 900 y llevan la hora.
- **`editar.ts`** hace el resto:
  - corta las escenas y les pone los carteles, en Cinzel, la letra del sitio;
  - las une con fundidos y las lleva a 1920 × 1080;
  - arma la música con tres tramos de "Shoulders of Giants", de Scott Buckley (CC BY 4.0, el tema del inicio del sitio; el crédito sale en el cartel final);
  - mezcla los sonidos del juego donde sonaron y deja el volumen en −14 LUFS.

## Para cambiar algo

- **Un lugar, los bots o lo que dicen:** se cambia en `ESCENAS` de `server/src/teaser.ts`. El server de desarrollo se reinicia solo.
- **Qué parte de cada escena entra al video, cuánto dura o qué dice el cartel:** se cambia en `ESCENAS` de `editar.ts`. Se puede volver a editar sin grabar de nuevo.
- **Para ver una escena sin grabar todo:** se arma con `/debug/teaser/escena?id=castillo&jugador=Nahuel` y se revisa con `/debug/teaser/estado`.

Las escenas de caza y del chamán sacan las criaturas del mapa que andan cerca, así no se meten en la toma. No vuelven hasta que se reinicia el server de juego.
