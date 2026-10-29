# Gruta del Abisal — Objetos y animaciones V2

Cada frame es un PNG **completo** con canal alfa RGBA, sin dividir en tiles. Se conserva el anclaje inferior al centro.

## Animaciones
- CO-01 Portales de salida y de atajo: **12 frames cada uno**, 64×96, 9 fps, bucle.
- CO-02 Cofre común: **16 frames**, 32×40, 12 fps, secuencia de apertura (no debe repetirse automáticamente), último frame abierto **sin objetos**.
- CO-PI Piedra de invocación: **12 frames**, 64×96, 9 fps, bucle. Inspiración general en grandes monolitos de invocación de fantasía, no réplica literal de ninguna pieza de juego.
- Antorcha encendida: **12 frames**, 48×80, 12 fps, bucle; apagada: PNG fijo.
- CO-16 Aplastador: secuencia adicional de **12 frames** en 32×64, y piezas individuales de estado (bloque y losa).

## Recursos estáticos
- CO-03 Cofre del jefe: abierto y cerrado (el abierto tiene interior oscuro vacío).
- GA-05 Escaleras de subir y bajar.
- GA-07 Barrera/pared lateral: común, cerradura pequeña, jefe, persiana, un sentido, bloque cerradura. Abierta=no se dibuja.
- CO-04 Bloque desplazable: un sprite independiente (el movimiento lo implementa el motor).
- CO-05 Placa: suelta y apretada.
- CO-06 Losa: sprite fijo.
- CO-16 Bloque aplastador y losa de caída.

## Consideraciones
Los originales proceden de las láminas artísticas de referencia trabajadas previamente en esta conversación, recortadas y reconstruidas para animar efectos. Las secuencias de portal, piedra y antorcha tienen dibujos estables; el cofre utiliza interpolación entre dos ilustraciones, por lo que sus frames intermedios pueden mostrar un leve efecto de transición en lugar de una bisagra físicamente perfecta. Revisar el arte en el mapeador antes de usar como definitivo.

Los frames están nombrados desde 00. Además hay spritesheets completos y GIF de prueba con fondo de tablero (solo el GIF de prueba tiene fondo; los PNG son transparentes). Para todos los objetos, x = centro, y = borde inferior. El orden de spritesheet es izquierda a derecha y luego de arriba abajo, 4 columnas.

*NO se modificó el repositorio GitHub.*
