# Casa de Subastas + Correo

## Auditoria Del Sistema Actual

### Inventario

El inventario runtime vive en `server/src/types/runtime.ts` como `InventoryRecord = Record<string, InventoryItem>`.
Cada item tiene:

- `idItem`: id del objeto en `server/jsons/objs.json`.
- `cant`: cantidad del stack.
- `equipped`: marca de equipado.

No existe hoy una entidad persistida por instancia para items normales. La tabla real es `character_items` en `api/schema.sql`, con clave `(character_id, id_pos)` y columnas `id_item`, `cant`, `equipped`.

Las operaciones runtime usan helpers en `server/src/game.ts` como `cloneInventoryRecord`, `removeItemFromInventoryRecord`, `addItemToRecord`, `serializeInventory`, `replaceInventoryRecord`, `quitarUserInvItem` y `agregarUserInvItem`.

### Oro

El oro del personaje esta en runtime como `user.gold` y en PostgreSQL como `characters.gold INTEGER`. El servidor usa `balance.clampGold` para mantenerlo dentro de limites. El cliente solo recibe actualizaciones via `handleProtocol.actGold`.

Para subastas se usa oro entero. En esta primera etapa se mantiene compatibilidad con `INTEGER`, pero el modelo nuevo queda separado para poder migrar a `BIGINT` sin cambiar la UI.

### Persistencia

La persistencia de personaje la hace el server llamando a la API:

- Snapshot general: `PUT /character_save/:id`.
- Items: `patchCharacterItems` en `api/src/repositories/characters`.
- Mercado existente: endpoints internos en `api/src/server.ts` y `api/src/repositories/market.ts`.

El flujo actual de mercado ya demuestra el patron server -> API con `vars.tokenAuth`, transacciones y claims.

### Mercado Existente

Existe un `market` simple:

- `market_listings`
- `market_claims`
- `api/src/repositories/market.ts`
- `server/src/game.ts` (`openMarketTrade`, `createMarketListing`, `buyMarketListing`, `claimMarket`)
- `frontend/components/MarketModal.tsx`

Ese sistema hace venta directa con claim, pero no soporta ofertas, buyout opcional, mails, historial ni oro reservado. Se toma como referencia de integracion, no como reemplazo de la casa de subastas.

### Trade Entre Jugadores

Existe `server/src/playerTrade.ts` y comandos `/comerciar`, `/ofertaritem`, `/ofertaroro`. La casa de subastas no debe compartir estado runtime con trade; debe persistir en PostgreSQL con transacciones.

### Protocolo

El server ya tiene un paquete generico `marketAction` que manda JSON desde frontend a server, y `openMarket` que devuelve JSON al frontend. Para evitar introducir paquetes innecesarios, la casa de subastas reutiliza ese canal con payload `kind: "auctionHouse"`.

### UI Existente

Las ventanas grandes usan componentes React sobre `/play`, con estilo oscuro/dorado. `MarketModal.tsx`, `WoaoHubModal.tsx` y `CraftingModal.tsx` son referencias visuales locales.

## Arquitectura Propuesta

### Principio

Todo movimiento economico es server-authoritative. El frontend solo solicita acciones; el server valida inventario, oro, estado, precio, cantidad y ownership.

### Modelo DB

Tablas nuevas:

- `auction_listings`: subasta activa/finalizada y asset en escrow.
- `auction_bids`: historial de ofertas.
- `auction_claims`: unica fuente reclamable para item/oro.
- `auction_mail`: correo de sistema que referencia opcionalmente un claim.

El asset se modela con:

- `asset_type`: `ITEM` hoy, `MOUNT` futuro.
- `item_id`, `quantity` para items actuales.
- `asset_payload JSONB` para datos completos si aparecen instancias o monturas.

### Estados

Auction:

- `ACTIVE`
- `SOLD_BY_BID`
- `SOLD_BY_BUYOUT`
- `EXPIRED`
- `CANCELLED`

Claim:

- `PENDING`
- `CLAIMED`

Claim types:

- `ITEM_WON`
- `ITEM_RETURN`
- `GOLD_SALE`

Mail categories:

- `AUCTION_SOLD`
- `AUCTION_EXPIRED`
- `AUCTION_WON`
- `AUCTION_OUTBID`
- `AUCTION_BID_RECEIVED`
- `SYSTEM`

### Anti Duplicacion

Al publicar:

1. El server calcula el inventario resultante.
2. La API reemplaza `character_items` dentro de la misma transaccion que crea `auction_listings`.
3. El item queda representado solo por la subasta activa.

Al resolver:

1. La subasta crea claims.
2. El claim es la unica fuente del premio.
3. Mail y tabs solo apuntan al mismo `auction_claims.id`.

### Expiraciones

La fuente de verdad es `ends_at`. Un settlement idempotente procesa:

```sql
WHERE status = 'ACTIVE'
AND ends_at <= NOW()
```

Se ejecuta al consultar/interactuar y puede ejecutarse al boot del server/API. No depende de `setTimeout`.

### Concurrencia

Las operaciones de oferta, buyout, cancelacion y claim usan transaccion y `FOR UPDATE`. El servidor nunca decide ganador solo con memoria Node.

### Oro Reservado

Una oferta descuenta oro disponible al ofertante. Si es superado, el oro anterior se libera dentro de la transaccion que acepta la nueva oferta. Si el jugador anterior esta online, el server sincroniza su `user.gold` cuando puede; si no, queda persistido en DB.

### Monturas Futuras

El flujo ya queda:

`subasta -> resultado -> claim -> reclamar -> cambio de propietario`

Para monturas se agregara `asset_type = 'MOUNT'` y `asset_payload`/referencia a instancia. No se entregara automaticamente nada.

## Fases Implementadas En Esta Rama

Primera version funcional:

- Subastas de items.
- Publicar con escrow.
- Buscar/listar.
- Ofertar con oro reservado.
- Buyout opcional.
- Cancelar sin ofertas.
- Claims de item/oro.
- Correo de sistema referenciando el mismo claim.
- UI compacta estilo World of Argentum.

Fuera de esta etapa:

- Subastas de monturas.
- Mail jugador a jugador.
- Migracion de oro a `BIGINT`.
- Realtime fino por suscripcion.
