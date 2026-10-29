# Razas: espejos por arquetipo

Estado al 2026-10-29. Las 12 razas vuelven a ser **espejos**: cada raza de la Alianza tiene una de la Horda con los mismos atributos, como en el cliente viejo (`old/Nuevo Motor Graf/Cliente 7.7 1280x720/CODIGO/frmCrearPersonaje.frm`). Los 6 pares son 6 arquetipos nivelados entre sí, medidos sobre el motor real.

## La tabla

| Arquetipo | Alianza | Horda | Fuerza | Agilidad | Inteligencia | Constitución | Carisma |
|---|---|---|---:|---:|---:|---:|---:|
| Arcano | Gnomo | Goblin | −1 | +1 | +4 | +2 | 0 |
| Místico | Elfo | Vampiro | 0 | +2 | +3 | +1 | 0 |
| Equilibrado | Humano | No-Muerto | +1 | +1 | +2 | +2 | 0 |
| Tanque | Enano | Orco | +2 | +1 | 0 | +2 | 0 |
| Bruto | Abisario | Licántropo | +2 | +2 | −1 | +1 | 0 |
| Ágil | Tauros | Elfo Oscuro | +1 | +2 | +1 | +1 | 0 |

El atributo es `18 + bono`. La tabla vive en cinco lugares que tienen que coincidir:
- `server/src/balanceData.ts`;
- `api/src/jsons/balance.json` (semilla de `game_balance`);
- `api/src/lib/characterCreation.ts`;
- `frontend/lib/characterCreation.ts`;
- `RACE_BASE_STATS` de `api/src/scripts/applyBalanceToCharacters.ts` y `exportBalanceComparison.ts`.

En producción manda el perfil de la tabla `game_balance` (ver "Personajes existentes y producción").

## Reglas

- **Fuerza y agilidad, hasta +2.** En PvP la fuerza y la agilidad efectivas tienen tope 40 (`PVP_ATTRIBUTE_CAP`) y el buff las duplica: +2 llega justo a 40 y +3 no suma nada.
- **Constitución, de +1 a +2.** El promedio queda en 1,5, igual que antes, para no mover el balance de clases (ver "Balance de clases").
- **Inteligencia, hasta +4.**
- **Carisma, 0 en todas.** Ningún código del juego lo usa.
- **Las razas no suman lo mismo, a propósito:**
  - la inteligencia solo les sirve a las clases con maná, así que una raza física resigna inteligencia sin perder nada;
  - con buen equipo, la fuerza casi no cuenta en PvP: los ítems dan +F y se llega igual al tope de 40.
  - Probamos que todas sumen 6 y que todas sumen 7: en ninguno de los dos casos hay una tabla en la que todas sirvan para algo.

## Cuánto vale cada punto

Medido con `razas.ts` (ver "Cómo repetir la medición"). Es el cambio de rendimiento PvP a nivel 50, promedio de los equipos de comerciante, común y tier:

| Atributo | Valor de un punto |
|---|---|
| Agilidad | 3 a 6 % para casi todas las clases. Para **pirata y ladrón**, pasar de +1 a +2 vale 40-55 %: viven de la evasión. |
| Constitución | 4 a 6 % (mago, 2,5 %): vida contra todo. |
| Fuerza | 1 a 2 %. Con equipo de comerciante, unos 4 % de daño; con el set de tier, casi nada. Pesa en PvE, donde no hay tope. |
| Inteligencia | 1,2 a 1,6 % para las clases con maná; 0 para las demás. |

## Resultado

`pnpm --dir server balance-razas --tiradas 10000`: nivel 50, buffeado, sin pasivas raciales, % respecto de la mejor raza de cada clase.

| Clase | Humano / No-Muerto | Elfo / Vampiro | Elfo Oscuro / Tauros | Enano / Orco | Gnomo / Goblin | Abisario / Licántropo |
|---|---:|---:|---:|---:|---:|---:|
| Mago | -3,2 | -4,2 | -6,8 | -6,4 | **mejor** | -10,2 |
| Clérigo | -0,9 | -4,0 | -6,0 | -2,8 | **mejor** | -7,3 |
| Guerrero | -1,3 | -2,7 | -1,6 | -0,4 | -4,0 | **mejor** |
| Asesino | **mejor** | -3,0 | -2,8 | -0,2 | -1,6 | -3,6 |
| Ladrón | -27,9 | -2,8 | -2,6 | -26,9 | -29,9 | **mejor** |
| Bardo | -0,9 | **mejor** | -2,0 | -3,7 | -1,7 | -4,1 |
| Druida | -1,9 | **mejor** | -2,5 | -3,4 | -1,4 | -4,4 |
| Paladín | **mejor** | -1,4 | -2,1 | -0,9 | -0,7 | -3,0 |
| Cazador | -0,4 | -2,3 | -1,3 | **mejor** | -3,2 | -1,2 |
| Pirata | -30,0 | -2,5 | **mejor** | -31,4 | -35,1 | -0,4 |
| Arquero | -0,1 | -3,2 | -2,3 | **mejor** | -2,3 | -2,0 |
| Chamán | -0,8 | **mejor** | -1,5 | -2,1 | -1,0 | -3,0 |

Cada arquetipo es el mejor, o queda a menos de 1,5 % del mejor, en entre 3 y 8 clases.

Pirata y ladrón necesitan agilidad +2: con Arcano, Equilibrado o Tanque rinden 27-35 % menos. Tienen tres arquetipos para elegir: Místico, Bruto y Ágil.

Paladín y asesino Tanque o Bruto no llegan a su hechizo principal sin equipo con maná. Les quedan 927 y 876 de maná, y Apocalipsis y Destello Infernal cuestan 950.

**Antes** (la tabla del 2026-10-21):
- **Tauros** era la mejor raza para 10 de las 12 clases y **No-Muerto** para las otras 2.
- Humano, Elfo Oscuro, Enano, Orco, Abisario y Licántropo no quedaban a menos de 1,5 % de la mejor en ninguna clase.
- Tauros es de la Alianza y su espejo, el Elfo Oscuro, era de las peores.

### Del documento de Ezequiel ([combat-balance.md](combat-balance.md))

- **Lo que se tomó:**
  - el modelo de vida: cada punto de constitución mueve 0,5 la vida por nivel;
  - el caso de control del mago.
- **Lo que no se tomó:** su tabla de razas. No estaba espejada y dejaba razas peores en todo que otras de su misma facción, como Elfo Oscuro frente a No-Muerto.

## Pasivas raciales

`server/src/racialPassives.ts`. Por par:

| Par | Alianza | Horda |
|---|---|---|
| Equilibrado | Humano: 5 % de resistencia mágica; Remover Parálisis cuesta 50 % menos | No-Muerto: 10 % menos de daño de flechas; Paralizar cuesta 50 % menos |
| Místico | Elfo: 10 % de recuperar 15 % del maná al lanzar | Vampiro: 8 % de recuperar 5 % de vida al recibir daño (20 % contra criaturas) |
| Arcano | Gnomo: +10 % de evasión | Goblin: 15 % de evitar una parálisis |
| Tanque | Enano: ×1,5 de daño físico con menos de 33 % de vida | Orco: 10 % de ignorar un hechizo dañino |
| Bruto | Abisario: 10 % de sobrevivir con 1 de vida a un golpe mortal | Licántropo: crítico de +20 % (10-15 %) |
| Ágil | Tauros: 5 % menos de daño mágico y físico | Elfo Oscuro: **+5 % de evasión y +5 % de daño con arco** (antes 3 % y 2 %) |

El Elfo Oscuro se subió porque quedaba muy por debajo del Tauros.

## Personajes existentes y producción

- **Atributos y maná:** se recalculan solos al entrar (`login.ts`).
- **Vida:** se tira en cada nivel y queda guardada, así que no se recalcula. Si la constitución guardada no coincide con la de la tabla, la vida se corre lo mismo que se corre el promedio, sin volver a tirar los niveles (`balance.getHpShiftForConstitutionChange`). Pasa una sola vez: al guardar ya queda la constitución nueva. Lo hacen tres lugares:
  - el login (`login.ts`);
  - la recarga del balance con jugadores conectados (`gameDataSync.refreshConnectedCharactersFromBalance`), sobre la vida base, sin el bono del set;
  - `applyBalanceToCharacters.ts`.
- **Ejemplos a nivel 50:**
  - Gnomo mago, constitución 18 → 20: de 337 a 388.
  - Tauros guerrero, 20 → 19: de 535 a 509.
  - Probado en local con Playwright: en el segundo login la vida no vuelve a cambiar.
- **Producción:**
  - el deploy no corre `import-game-data` y `game_balance` solo se siembra con la tabla vacía;
  - por eso la api aplica la tabla nueva una sola vez al arrancar: migración `2026-10-29-razas-espejo` de `api/src/dataMigrations.ts`, anotada en `data_migrations`;
  - un cambio posterior desde el panel de admin no se pisa.

## Balance de clases

El simulador de clases (`balance-sim`) usa Humano en todos los cruces. Con el Humano nuevo (+1 / +1 / +2 / +2 en vez de +1 / +1 / 0 / +2), la vida no cambia y solo sube el maná:

| | Antes | Ahora |
|---|---|---|
| Cruces a ±0,5 del objetivo, equipo común (nivel 50) | 101 de 187 | 102 de 187 |
| Error cuadrático medio, tier | 0,80 | 0,55 |
| Clérigo con set mata a mago con set de combo (golpe + magia) | 80 % | 81 % |
| Flechas del arquero con set para matar a un mago con set | 2,04 | 2,04 |

Con constitución de +2 a +3 (promedio 2,5), los magos de 21 aguantaban más: el combo del clérigo bajaba al 8 % y el arquero necesitaba 2,72 flechas. Por eso el tope de constitución quedó en +2.

## Cómo repetir la medición

```bash
pnpm --dir server balance-razas                                  # la tabla del código
pnpm --dir server balance-razas --perfil-balance <db.json>       # el perfil exportado de game_balance
pnpm --dir server balance-razas --lineas <archivo.json>          # líneas a probar: { "nombre": { fuerza, agilidad, inteligencia, constitucion } }
```

`server/src/scripts/balanceSim/razas.ts`:
- cada raza pelea contra un rival de la misma clase con todo en +0, sin pasivas raciales;
- por clase combina el duelo físico, la vida (aguantar magia) y el maná, con pesos por rol;
- para el mago, cuenta solo la defensa física.
