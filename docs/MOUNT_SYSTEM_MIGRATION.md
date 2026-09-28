# Migracion del sistema de mascotas y monturas

Estado: fase 1, auditoria y diseno.  
Fecha de trabajo: 2026-09-25.

Este documento fija la lectura del sistema viejo en `old/`, el estado parcial del sistema nuevo y el diseno objetivo antes de empezar la implementacion fuerte. La regla base es conservar la esencia de World of Argentum, pero corregir la migracion parcial actual: una mascota nacida no debe ser un item mejorado, debe ser una entidad unica persistida.

## Objetivo

El flujo final debe separar claramente:

```text
Huevo u obtencion
  -> eclosiona/domestica
  -> MountInstance UUID
      -> especie
      -> nivel
      -> experiencia
      -> dano NPC propio
      -> stats
      -> talentos
      -> propietario
```

Un item puede iniciar la obtencion, pero la mascota real vive como entidad propia. Dos Tigre Blanco del mismo jugador tienen que poder ser dos entidades distintas, con ID, rolls, stats y talentos diferentes.

## Archivos auditados del sistema viejo

- `old/Nuevo Motor Graf/Servidor 7.0/Codigo/Monturas.bas`
  - `EnviarMontura`
  - `ResetMontura`
  - `CheckMonturaLevel`
  - `UsaMontura`
  - `DarMontura`
  - `DomarMontura`
  - `MontarSoltar`
- `old/Nuevo Motor Graf/Servidor 7.0/Codigo/FileIO.bas`
  - `LoadPorcentajesMascotas`
  - carga de `MONTURA1..3`
  - guardado de `MONTURA1..3`
- `old/Nuevo Motor Graf/Servidor 7.0/Codigo/Declares.bas`
  - `PMascotas`
  - `UserMONTURA`
  - `MAXMONTURA`
  - `OBJTYPE_Montura`
  - `OBJTYPE_HUEVOS`
- `old/Nuevo Motor Graf/Servidor 7.0/Codigo/Modulo_InventANDobj.bas`
  - drops especiales de huevos de mascotas.
- `old/Nuevo Motor Graf/Servidor 7.0/Codigo/MODULO_NPCs.bas`
  - experiencia de mascota al matar NPC sin party.
- `old/Nuevo Motor Graf/Servidor 7.0/Codigo/ModParty.bas`
  - experiencia de mascota al matar NPC en party.
- `old/Nuevo Motor Graf/Servidor 7.0/Codigo/mdlCOmercioConUsuario.bas`
  - comercio entre usuarios con transferencia de datos de montura.
- `old/Nuevo Motor Graf/Servidor 7.0/Dat/OBJ.dat`
  - items de montura y huevos.
- `old/Nuevo Motor Graf/Servidor 7.0/Dat/NPCs.dat`
  - criaturas domables.
- `old/Nuevo Motor Graf/Servidor 7.0/Dat/Donaciones.dat`
  - huevos de mascotas ofrecidos por donacion.
- `old/Nuevo Motor Graf/Servidor 7.0/Dat/Body.dat`
  - cuerpos usados por monturas.

## Archivos auditados del sistema nuevo

- `server/src/mounts.ts`
- `server/src/woaoProgress.ts`
- `server/src/playerTrade.ts`
- `server/src/tame.ts`
- `server/src/game.ts`
- `server/jsons/mountTypes.json`
- `frontend/components/WoaoHubModal.tsx`

## Sistema viejo: modelo de datos

El servidor viejo define `MAXMONTURA = 12` y guarda datos en arrays por tipo dentro de `UserMONTURA`:

- `Nivel(1 To MAXMONTURA)`
- `exp(1 To MAXMONTURA)`
- `Elu(1 To MAXMONTURA)`
- `Vida(1 To MAXMONTURA)`
- `Golpe(1 To MAXMONTURA)`
- `Nombre(1 To MAXMONTURA)`
- `AtMagico`
- `DefMagico`
- `AtCuerpo`
- `Defcuerpo`
- `AtFlechas`
- `DefFlechas`
- `Evasion`
- `Libres`
- `Tipo`
- `index`

Aunque el array tiene 12 tipos, el personaje persiste solo tres slots reales:

- `MONTURA1`
- `MONTURA2`
- `MONTURA3`

El campo `NroMonturas` cuenta cuantas tiene el personaje. Varias validaciones usan `Nmonturas > 2`, por lo que el limite efectivo viejo era 3 mascotas por personaje. Esta restriccion debe mantenerse al inicio como `MAX_OWNED_MOUNTS = 3`, documentada y centralizada.

Limitacion vieja: la identidad real de la mascota no es un UUID, sino una combinacion de tipo y slot. Esto impide tener dos mascotas del mismo tipo y complica un mercado moderno.

## Sistema viejo: especies y mapeo inicial

`LoadPorcentajesMascotas` define 12 tipos:

| TypeId | Nombre viejo | Nombre objetivo | Item montura | Body | Huevo viejo |
| --- | --- | --- | --- | --- | --- |
| 1 | Unicornio | Unicornio | OBJ888 | 275 | OBJ1529 |
| 2 | Caballo Negro / Caballo | Caballo Negro | OBJ889 | 279 | OBJ1520 |
| 3 | Tigre | Tigre Blanco | OBJ890 | 281 | OBJ1528 |
| 4 | Elefante | Elefante | OBJ891 | 283 | OBJ1522 |
| 5 | Dragon | Dragon Dorado | OBJ892 | 306 | OBJ1524 |
| 6 | Jabato | Jabato | OBJ893 | 368 | OBJ1525 |
| 7 | Kong | Kong | OBJ894 | 347 | OBJ1526 |
| 8 | Hipogrifo | Grifo | OBJ895 | 349 | OBJ1523 |
| 9 | Rinosaurio | Rinosaurio | OBJ896 | 386 | OBJ1527 |
| 10 | Cerbero | Cerbero | OBJ897 | 385 | OBJ1521 |
| 11 | Wyvern | Wyvern | OBJ898 | 382 | OBJ1530 |
| 12 | Avestruz | Avestruz | OBJ899 | 367 | OBJ1519 |

No se deben cambiar IDs a ciegas. La normalizacion de nombre debe ser de presentacion, manteniendo `typeId` historico salvo que haya un motivo tecnico fuerte para migrarlo.

Notas:

- `OBJ.dat` llama `Caballo` al item de montura, pero el tipo y huevo usan `Caballo Negro`.
- `OBJ.dat` llama `Tigre` al item/huevo, pero el diseno final pide `Tigre Blanco`.
- `Hipogrifo` parece ser el equivalente historico del `Grifo` pedido.
- `Dragon` viejo se presenta como `Dragon Dorado` en huevos/donaciones y debe mapearse con cuidado.

## Sistema viejo: stats por especie

`PMascotas` define bonus base por especie:

- ataques: `AumentoCuerpo`, `AumentoMagia`, `AumentoFlecha`
- defensas: `ReduceCuerpo`, `ReduceMagia`, `ReduceFlecha`
- evasion: `AumentoEvasion`
- progresion: `VidaporLevel`, `GolpeporLevel`
- topes de entrenamiento: `TopeAtMagico`, `TopeDefMagico`, `TopeAtFlechas`, `TopeDefFlechas`, `TopeAtCuerpo`, `TopeDefCuerpo`, `TopeEvasion`

El sistema nuevo no debe copiar estos numeros sin verificar donde entran las formulas actuales. Sirven como referencia de perfil, no como balance final obligatorio.

## Sistema viejo: niveles y experiencia

El viejo tenia topes distintos:

- nivel 30: Unicornio, Caballo Negro, Tigre, Elefante, Rinosaurio, Cerbero, Wyvern, Avestruz
- nivel 16: Dragon, Jabato
- nivel 17: Kong, Hipogrifo

El diseno nuevo reemplaza esto por:

```text
maxLevel = 30 para todas las especies
```

La experiencia vieja se cargaba en `PMascotas(nn).exp(n)`:

- especies normales: acumulador `aa += 400`
- Dragon/Kong/Hipogrifo: acumulador `bb += 1800`
- Jabato: acumulador `cc += 20`

El diseno nuevo elimina esas diferencias:

```ts
getMountExpRequired(level) = level * 400
```

Ejemplos:

- nivel 1 a 2: 400
- nivel 2 a 3: 800
- nivel 29 a 30: 11600

Si `expStep` se conserva temporalmente por compatibilidad de archivos, no debe ser usado para calcular experiencia.

## Sistema viejo: subida de nivel

`CheckMonturaLevel`:

- verifica `flags.ClaseMontura`
- corta si supera el tope
- si `exp >= Elu`, sube un nivel
- resetea `exp = 0`
- asigna nuevo `Elu`
- aumenta `Vida` con `Random(VidaporLevel / 2, VidaporLevel)`
- aumenta `Golpe` con `Random(GolpeporLevel / 2, GolpeporLevel)`
- envia paquetes de actualizacion al cliente

La migracion nueva debe conservar la idea de crecimiento aleatorio, pero con estas reglas nuevas:

- `npcDamage` inicial: `Random(5, 20)`
- al subir nivel: `npcDamage += Random(5, 20)`
- stats secundarios tambien crecen con rolls server-side
- cada roll se persiste
- los rolls no se recalculan al login, al montar ni al refrescar UI
- el level-up debe ser idempotente por nivel

## Sistema viejo: experiencia de mascota al matar NPC

En `MODULO_NPCs.bas`, si el usuario no esta en party, la mascota montada gana:

```text
Int(MinPc.GiveEXP * Expdemas / 4000)
```

En `ModParty.bas`, si el usuario esta en party, la mascota montada gana:

```text
Int(expIndi / 4000)
```

El jugador sigue recibiendo su experiencia por matar NPC. El nuevo sistema debe conservar esta independencia: la mascota gana experiencia propia sin robar experiencia del personaje.

La cantidad exacta de experiencia de mascota en el sistema nuevo debe centralizarse en una funcion o configuracion, porque hoy `server/src/mounts.ts` usa `+15` fijo en cada kill.

## Sistema viejo: uso como montura

`UsaMontura` aplica restricciones historicas:

- no bebe
- no navegando
- no comerciando
- no ceguera/estupidez
- no angel, morph, demonio o muerto
- mapas bloqueados especificos
- no usar si `flags.Montura = 2`
- al montar, cambia `Char.Body` por `NumRopaje`
- guarda `flags.ClaseMontura = Montura.SubTipo`
- aumenta peso maximo en `ClaseMontura * 100`
- al desmontar resta el peso y restaura apariencia/equipamiento

El nuevo `server/src/game.ts` ya restaura apariencia y cambia `idBody`, pero no replica todo el set historico de restricciones. Hay que migrar solo las reglas que siguen teniendo sentido. En particular, no arrastrar la restriccion historica del Jabato por nivel, porque el diseno nuevo pide que todas lleguen a 30.

## Sistema viejo: domesticacion

`DomarMontura`:

- toma el NPC cercano domable.
- calcula item con `tc = Npclist(NpcIndex).flags.Domable + 387`.
- rechaza si el personaje ya tiene ese item.
- rechaza si ya tiene ese tipo en `MONTURA1..3`.
- mete el item en inventario.
- elimina el NPC domado.
- inicializa datos de montura:
  - nivel 1
  - exp 0
  - `Elu = PMascotas(xx).exp(1)`
  - vida random con rango de especie
  - golpe random con rango de especie
  - nombre por tipo
  - stats base en 1
  - libres +4
  - tipo
- persiste en el primer slot libre `MONTURA1..3`.

El sistema nuevo tiene `server/src/tame.ts`, pero actualmente:

- mantiene una chance fija segun clase/nivel.
- entrega item al inventario.
- llama a `prepareMount`, que crea progreso por `mountTypeId`.
- no crea una entidad UUID.

Conclusion: la domesticacion debe migrarse para crear `MountInstance`, no solo item/progreso por tipo.

## Sistema viejo: huevos

`OBJ.dat` define huevos de mascotas con `ObjType=43`:

- `OBJ1519` Huevo de Avestruz
- `OBJ1520` Huevo de Caballo Negro
- `OBJ1521` Huevo de Cerbero
- `OBJ1522` Huevo de Elefante
- `OBJ1523` Huevo de Hipogrifo
- `OBJ1524` Huevo de Dragon Dorado
- `OBJ1525` Huevo de Jabato
- `OBJ1526` Huevo de Kong
- `OBJ1527` Huevo de Rinosaurio
- `OBJ1528` Huevo de Tigre
- `OBJ1529` Huevo de Unicornio
- `OBJ1530` Huevo de Wyvern

`Donaciones.dat` tambien lista huevos de mascotas como premios/donaciones.

`Modulo_InventANDobj.bas` tiene drops hardcodeados por NPC numero:

- NPC 616 -> huevo Unicornio `1529`
- NPC 617 -> huevo Caballo Negro `1520`
- NPC 618 -> huevo Tigre `1528`
- NPC 619 -> huevo Elefante `1522`
- NPC 620 -> huevo Dragon Dorado `1524`
- NPC 669 -> huevo Jabato `1525`
- NPC 672 -> huevo Rinosaurio `1527`
- NPC 673 -> huevo Cerbero `1521`
- NPC 674 -> huevo Wyvern `1530`
- NPC 675 -> huevo Avestruz `1519`

No aparecieron drops equivalentes en ese bloque para Kong/Hipogrifo, aunque existen huevos en `OBJ.dat` y `Donaciones.dat`.

El nuevo sistema debe cambiar el flujo: un huevo puede eclosionar a una especie desde un pool configurable, no por `if npc.numero == ...` disperso.

## Sistema viejo: comercio de mascotas

Hay dos caminos relevantes:

- `DarMontura`: envio/offline por nombre de personaje, usando archivo `.chr`.
- `mdlCOmercioConUsuario.bas`: comercio entre usuarios.

El comercio viejo transfiere datos completos de la mascota:

- nivel
- exp
- elu
- vida
- golpe
- nombre
- ataques/defensas/evasion
- libres
- tipo

Despues limpia el slot del duenio anterior y actualiza `NroMonturas`.

Limitacion: como no hay UUID, el sistema valida por tipo/slot. El nuevo comercio debe transferir ownership de una entidad existente, no recrearla ni regenerarla.

## Sistema actual: comportamiento

`server/src/mounts.ts` carga `server/jsons/mountTypes.json`, que conserva perfiles historicos y `expStep`.

La persistencia actual esta en `server/src/woaoProgress.ts`:

```ts
mounts: Record<string, MountProgress>
```

La key es `mountTypeId`, no una instancia. `MountProgress` contiene:

- `nivel`
- `exp`
- `elu`
- `vida`
- `golpe`
- `name`

Problemas:

- un personaje no puede tener dos mascotas del mismo tipo.
- no existe `mountInstanceId`.
- no existe `ownerCharacterId` por mascota.
- no hay `createdAt`.
- no hay `rollHistory`.
- no hay talentos.
- no hay stats separados por melee/ranged/magic/evasion como entidad.
- el comercio de jugadores solo mueve items y oro, no entidades de mascota.
- `tame.ts` entrega item y llama `prepareMount`, pero no crea una instancia.
- `onNpcKilled` suma `15` exp fijo y usa `expStep`.
- `applyOutgoingDamage` mezcla `golpe` con bonus de tipo y solo cubre melee/ranged.
- la UI de `WoaoHubModal` lista tipos, no mascotas poseidas reales.

## Diferencias que se deben corregir

1. Pasar de `mounts[typeId]` a `mountInstances[id]`.
2. Permitir multiples mascotas del mismo tipo.
3. Preservar identidad al comerciar.
4. Unificar `maxLevel = 30`.
5. Unificar experiencia con `getMountExpRequired(level)`.
6. Separar `npcDamage` de los bonus PvE/PvP.
7. Agregar talentos en niveles 10, 20 y 30.
8. Centralizar caps.
9. Migrar huevos a pool configurable.
10. Crear manager server-authoritative para NPC especial de huevos.
11. Mantener limite inicial de 3 mascotas, centralizado.
12. Abstraer persistencia para no depender indefinidamente de `server/data/woaoProgress.json`.

## Modelo objetivo

Interface conceptual:

```ts
type MountInstance = {
  id: string;
  typeId: number;
  ownerCharacterId: string;
  name: string;
  level: number;
  exp: number;
  npcDamage: number;
  vida: number;
  meleeAttack: number;
  meleeDefense: number;
  rangedAttack: number;
  rangedDefense: number;
  magicAttack: number;
  magicDefense: number;
  evasion: number;
  perks: {
    level10?: string;
    level20?: string;
    level30?: string;
  };
  rollHistory: MountRoll[];
  previousOwners?: string[];
  createdAt: string;
  updatedAt: string;
};
```

El nombre exacto puede adaptarse al codigo, pero estos conceptos son obligatorios.

## Configuracion objetivo

Crear o preparar estructuras equivalentes a:

- `server/jsons/mountTypes.json`
  - typeId historico
  - displayName normalizado
  - bodyId/itemId/huevo viejo si aplica
  - maxLevel 30
  - perfil base
- `server/jsons/mountTalentTable.json`
  - talentos por especie y milestone.
- `server/jsons/eggHatchPool.json`
  - `{ mountTypeId, weight }`.
- `server/jsons/eggDropConfig.json`
  - `eggItemId`
  - `quantity`
  - `chance`
- `server/jsons/specialEggNpcConfig.json`
  - `npcTemplateId`
  - `spawnMaps: [35]`
  - `minRespawnMinutes`
  - `maxRespawnMinutes`

Punto importante: el mapa 35 no debe estar escrito dentro del codigo del manager. Debe venir de `spawnMaps: [35]`.

## Talentos

Regla general:

- nivel 10: sortear 1 talento de la especie.
- nivel 20: sortear 1 talento de la especie.
- nivel 30: sortear 1 talento de la especie.
- persistir una sola vez.
- no recalcular.
- no duplicar por reconexion.

Caps centralizados:

```ts
PVP_DAMAGE_CAP = 0.05
PVE_DAMAGE_CAP = 0.10
DEFENSE_CAP = 0.10
EVASION_CAP = 0.10
NPC_DAMAGE_REDUCTION_CAP = 0.10
```

La tabla inicial debe implementarse desde el prompt adjunto:

| Especie | Nivel 10 | Nivel 20 | Nivel 30 |
| --- | --- | --- | --- |
| Jabato | +4% defensa fisica / +4% defensa proyectiles / +3% evasion | +6% defensa fisica / +5% vida maxima / -5% dano NPC recibido | +8% defensa fisica / -8% dano NPC recibido / +7% vida maxima |
| Avestruz | +4% evasion / +3% defensa proyectiles / +3% dano proyectiles PvP | +6% evasion / +5% defensa proyectiles / +6% dano NPC | +8% evasion / +7% defensa proyectiles / +10% dano NPC |
| Caballo Negro | +3% dano fisico PvP / +4% defensa fisica / +3% evasion | +6% dano NPC / +5% defensa fisica / +5% evasion | +5% dano fisico PvP / +10% dano NPC / +8% defensa fisica |
| Unicornio | +3% dano magico PvP / +4% defensa magica / +4% mana maximo | +6% dano magico NPC / +6% defensa magica / +5% regeneracion mana | +5% dano magico PvP / +10% dano magico NPC / +8% defensa magica |
| Tigre Blanco | +3% dano fisico PvP / +4% evasion / +5% dano NPC | +7% dano NPC / +6% evasion / +4% defensa fisica | +5% dano fisico PvP / +10% dano NPC / +9% evasion |
| Elefante | +5% vida maxima / +4% defensa fisica / +4% defensa proyectiles | +7% vida maxima / +6% defensa fisica / -6% dano NPC recibido | +10% vida maxima / +8% defensa fisica / -10% dano NPC recibido |
| Rinosaurio | +3% dano fisico PvP / +4% defensa fisica / +5% dano NPC | +7% dano NPC / +6% defensa fisica / +6% vida maxima | +5% dano fisico PvP / +10% dano NPC / +9% defensa fisica |
| Cerbero | +3% dano fisico PvP / +3% dano magico PvP / +4% defensa magica | +6% dano NPC / +6% defensa magica / +5% vida maxima | +5% dano PvP del perfil / +10% dano NPC / +8% defensa magica |
| Wyvern | +3% dano magico PvP / +4% evasion / +4% defensa proyectiles | +7% dano magico NPC / +6% evasion / +6% defensa proyectiles | +5% dano magico PvP / +10% dano NPC / +9% evasion |
| Dragon Dorado | +3% dano fisico PvP / +3% dano magico PvP / +3% dano proyectiles PvP | +7% dano NPC / +5% todas las defensas / +5% evasion | +5% dano PvP del tipo sorteado / +10% dano NPC / +8% todas las defensas |
| Kong | +3% dano fisico PvP / +5% vida maxima / +4% defensa fisica | +7% dano NPC / +7% vida maxima / +6% defensa fisica | +5% dano fisico PvP / +10% dano NPC / +10% vida maxima |
| Grifo | +3% dano proyectiles PvP / +4% evasion / +4% defensa magica | +7% dano NPC / +6% evasion / +6% defensa magica | +5% dano proyectiles PvP / +10% dano NPC / +9% evasion |

## Huevos y NPC especial

El nuevo diseno pide un unico NPC especial global que dropee huevos.

Requisitos:

- una sola instancia viva en todo el mundo.
- spawnea en un mapa elegido desde `spawnMaps`.
- configuracion inicial: `spawnMaps: [35]`.
- cuando haya mas mapas, no cambiar codigo.
- elegir tile caminable valido usando datos de colision/mapa.
- no spawnear en pared, agua invalida, bloqueo u ocupacion.
- al morir, dropear huevo segun configuracion.
- iniciar timer de respawn configurable.
- evitar duplicacion por reload, doble timer o restart.

Manager propuesto:

```ts
EggCarrierNpcManager
```

Responsabilidades:

- cargar config.
- elegir mapa.
- elegir posicion valida.
- crear NPC si no existe uno.
- detectar muerte.
- aplicar drop.
- programar respawn.
- garantizar `countWorldInstances <= 1`.

## Flujo de huevo nuevo

```text
Jugador usa huevo
  -> server consume item
  -> server sortea mountType desde eggHatchPool
  -> server crea MountInstance UUID
  -> server genera stats iniciales
  -> server genera npcDamage Random(5,20)
  -> level = 1
  -> exp = 0
  -> ownerCharacterId = personaje
  -> persiste
  -> UI/protocolo muestra la nueva mascota
```

No se debe entregar solamente un tipo ni un item de montura con progreso implicito.

## Comercio nuevo

El trade debe operar sobre `mountInstanceId`.

Validaciones minimas:

- la instancia existe.
- `ownerCharacterId` actual coincide con quien oferta.
- la mascota no esta bloqueada/equipada si el flujo asi lo exige.
- el receptor tiene capacidad.
- la sesion de comercio sigue vigente.
- no existe la misma instancia en dos owners.

Operacion:

```text
begin atomic transfer
  ownerCharacterId A -> B
  previousOwners append A opcional
  active mount de A se limpia si era esa mascota
  indexes/cache se actualizan
commit
```

No regenerar stats. No resetear nivel. No crear una copia.

## Persistencia

El sistema actual usa `server/data/woaoProgress.json`. Para produccion conviene preparar una abstraccion:

```ts
MountRepository
  listByOwner(characterId)
  getById(id)
  create(instance)
  save(instance)
  transferOwner(instanceId, fromOwner, toOwner)
```

Implementacion inicial aceptable:

- JSON compatible con el estado local actual.
- funciones atomicas a nivel proceso.
- esquema pensado para migrar a DB.

Estructura conceptual:

```json
{
  "mountInstances": {
    "uuid": {
      "id": "uuid",
      "typeId": 3,
      "ownerCharacterId": "character-id",
      "level": 12,
      "exp": 350,
      "npcDamage": 128,
      "stats": {},
      "perks": {},
      "rollHistory": []
    }
  },
  "mountsByOwner": {
    "character-id": ["uuid"]
  }
}
```

## Migracion desde progreso actual

No descartar `progress.mounts[typeId]`.

Por cada entrada actual:

1. crear `MountInstance` nueva.
2. preservar:
   - `nivel`
   - `exp`
   - `elu` solo si se necesita compat temporal; el nuevo calculo debe usar `getMountExpRequired`.
   - `vida`
   - `golpe` como base para `npcDamage` o campo historico mapeado con cuidado.
   - `name`
3. setear `ownerCharacterId`.
4. mapear `typeId`.
5. generar perks faltantes una sola vez si `level >= 10`, `>= 20`, `>= 30`.
6. no regenerar valores ya existentes.
7. dejar marca de migracion.

## UI y protocolo

El frontend debe dejar de mostrar solo tipos de `mountTypes.json`. Debe poder consultar mascotas poseidas reales:

- `id`
- nombre
- especie
- nivel
- exp actual
- exp requerida
- `npcDamage`
- vida
- stats
- talentos por milestone
- activa/montada

El panel de montura puede inspirarse en las UI del prompt:

- lista izquierda de mascotas poseidas.
- detalle central con sprite/preview.
- stats compactas.
- talentos obtenidos.
- informacion de ownership/ID corto.
- acciones: montar, renombrar, liberar.
- vista de abrir huevo.
- vista de comercio de mascota que avise que se transfiere esa misma instancia con todo su progreso.

## Plan por fases

1. Auditoria, documento, modelo de dominio y repositorio.
2. `MountInstance`, experiencia comun, nivel, rolls de stats y `npcDamage`.
3. Talentos, caps y modificadores de combate.
4. Ownership y comercio seguro de mascotas.
5. Huevos, hatch pool, NPC unico, spawn por mapas configurables y respawn.
6. Frontend/protocolo del panel de mascotas y trade UI.
7. Migracion de progreso existente, tests y balance.

## Tests obligatorios

1. Todas las especies tienen `maxLevel = 30`.
2. Todas usan la misma EXP requerida.
3. Nivel 1 a 2 requiere lo mismo para cualquier especie.
4. Level-up genera `npcDamage` entre +5 y +20.
5. El roll queda persistido.
6. Reiniciar server no cambia rolls.
7. Dos Tigre Blanco nivel 20 pueden tener stats diferentes.
8. Nivel 10 genera exactamente un perk.
9. Nivel 20 genera exactamente un perk.
10. Nivel 30 genera exactamente un perk.
11. No genera perk dos veces.
12. PvP damage nunca supera 5%.
13. PvE percentage damage nunca supera 10%.
14. Evasion respeta cap.
15. Defensas respetan caps.
16. Mascota gana EXP sin reducir la del jugador.
17. Comercio conserva ID, nivel, EXP, stats y perks.
18. Owner cambia correctamente.
19. No duplicacion.
20. Huevo genera nueva instancia.
21. Huevo puede generar distintas especies.
22. Hatch respeta weight table.
23. NPC de huevos tiene maximo una instancia mundial.
24. Con config inicial aparece solo en mapa 35.
25. No aparece en tile bloqueado.
26. Al morir inicia respawn.
27. Reload no duplica NPC.
28. Reinicio no duplica mascota.
29. Jabato puede llegar a nivel 30.
30. Dragon Dorado puede llegar a nivel 30.
31. Kong puede llegar a nivel 30.
32. Grifo puede llegar a nivel 30.

## Decisiones cerradas

- `spawnMaps: [35]` va en configuracion, no hardcodeado en codigo.
- la mascota nacida es entidad UUID.
- `mounts[typeId]` no es modelo final.
- el item/huevo es mecanismo de obtencion, no la mascota persistente.
- todos los max level son 30.
- toda experiencia requerida sale de `getMountExpRequired(level)`.
- `npcDamage` no se aplica a PvP.
- perks solo aplican con esa mascota activa/montada.
- no se acumulan bonus por tener muchas mascotas.
- comercio transfiere la misma instancia.
- mantener limite inicial de 3 mascotas poseidas hasta que se decida cambiarlo.

## Riesgos y puntos a revisar antes de implementar

- Hay que revisar formulas actuales de combate antes de mapear `AtCuerpo`, `DefCuerpo`, `AtFlechas`, `DefFlechas`, `AtMagico`, `DefMagico` y `Evasion`.
- El sistema viejo tiene caminos duplicados de obtencion (`DomarMontura`, uso de inventario y comercio). La migracion debe evitar crear tres formas distintas de crear instancias.
- Si se mantiene JSON inicialmente, hay que cuidar escrituras concurrentes del trade.
- El frontend actual no tiene datos de mascotas reales; necesitara protocolo/API nuevo.
- El mapeo `Hipogrifo -> Grifo`, `Tigre -> Tigre Blanco` y `Dragon -> Dragon Dorado` debe conservar IDs historicos y normalizar solo displayName.
- El sistema especial de NPC de huevos debe integrarse con el lifecycle real de NPCs del servidor para evitar duplicados tras reload/restart.
