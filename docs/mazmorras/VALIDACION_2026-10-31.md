# Validación de los arreglos de mazmorras

Probado en el cliente local y en corridas reales de la mazmorra de prueba, con un personaje temporal eliminado al terminar.

| Cambio | Resultado observado |
|---|---|
| Puerta lateral | Índices 42882–42885 desplazados 16 px hacia abajo. Se cruzó el paso entre ambas salas. [Captura](../../screenshots/dungeon-puerta-lateral.png) |
| Aplastadores | Ocultos en reposo. Caminar en la baldosa vecina mantuvo la vida y no activó objetos. Pisar la posición sorteada creó el aplastador, aplicó el golpe y volvió a ocultarlo. Otra corrida eligió otras tres posiciones. [Captura](../../screenshots/dungeon-trampa-al-pisar.png) |
| Piso cubierto | Primera pisada: grieta y 5000 HP. Segunda pisada en la misma baldosa: hueco, caída y 4500 HP. El hueco se repone a los cinco segundos. Los pozos de los acertijos del Gancho del mapa 591 conservan su comportamiento. [Primera pisada](../../screenshots/dungeon-piso-primera-pisada.png), [caída](../../screenshots/dungeon-piso-segunda-pisada.png) |
| Boss acuático | Desde tierra: golpes, hechizos, fuego, gancho, flechas y bombas no redujeron sus 1500 HP. Nadando, pasando por los manejadores de paquetes de combate: Dardo Mágico quitó 16 HP, un golpe quitó 50 HP y el arco de mazmorra también dañó al boss. Una explosión aislada mantuvo 1500 HP. [Combate en agua](../../screenshots/dungeon-boss-combate-agua.png) |
| Unión de paredes | La unión en T mantiene las tres columnas del muro vertical y su borde continuo. [Captura](../../screenshots/dungeon-pared-continua.png) |
| Reja rompible | La barrera del mapa 591 en 13,40 usa la reja de 330048.png. Una bomba cambió el objeto cerrado por el arco abierto y habilitó el paso. [Cerrada](../../screenshots/dungeon-reja-cerrada.png), [abierta](../../screenshots/dungeon-reja-abierta.png) |

Comprobaciones automáticas:

- 43 pruebas aprobadas: `corepack pnpm exec tsx --test src/dungeons.test.ts src/dungeonFixes.test.ts src/pvpBalance.test.ts`, desde `server/`.
- TypeScript sin errores en `server/` y `frontend/`.
- ESLint sin errores en los módulos de código modificados.
- Consola del navegador durante la prueba del juego: 0 errores; 2 advertencias.

Se regeneraron y comprobaron las copias de los mapas 590 y 591 para servidor, API y cliente. Se retiró el servidor auxiliar de validación y se dejó el servidor de juego normal ejecutándose.
