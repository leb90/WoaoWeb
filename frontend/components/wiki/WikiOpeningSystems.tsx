import Image from "next/image";
import Link from "next/link";
import { WikiSection } from "./WikiUi";
import clanLevels from "@/public/init/opening/clanLevels.json";
import rewards from "@/public/init/opening/openingRewards.json";
import ranks from "@/public/init/opening/npcRanks.json";
const format = (n: number) => n.toLocaleString("es-AR");
const itemNames: Record<number, string> = { 1095: "Huevo Dragón", 1096: "Diamante Sangre", 1241: "Corazón Oscuro" };
function Capture({ file, alt, caption }: { file: string; alt: string; caption: string }) {
    return (
        <figure className="my-5 overflow-hidden border border-amber-200/20 bg-black/30">
            <a href={`/wiki/apertura/${file}.png`} target="_blank" rel="noreferrer">
                <Image
                    src={`/wiki/apertura/${file}.png`}
                    alt={alt}
                    width={1280}
                    height={800}
                    className="h-auto w-full"
                />
            </a>
            <figcaption className="px-4 py-3 text-xs leading-5 text-stone-400">{caption}</figcaption>
        </figure>
    );
}
function Table({ heads, children }: { heads: string[]; children: React.ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-amber-200/15 text-amber-100">
                        {heads.map((h) => (
                            <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-stone-300">{children}</tbody>
            </table>
        </div>
    );
}
function Cell({ children }: { children: React.ReactNode }) {
    return <td className="px-3 py-3 align-top">{children}</td>;
}

export default function WikiOpeningSystems({ section }: { section: string }) {
    if (section === "comunidad")
        return (
            <div className="mt-6 space-y-6">
                <WikiSection title="Niveles del clan">
                    <p className="text-sm leading-6 text-stone-300">
                        Un clan comienza en nivel 1. El líder abre <strong>Clanes → Tu clan</strong> y usa{" "}
                        <strong>Subir de nivel</strong> cuando reúne todos los requisitos. La reputación del ranking no
                        compra niveles.
                    </p>
                    <Capture
                        file="clan-requisitos"
                        alt="Panel del clan con nivel, cupo y requisitos disponibles para subir"
                        caption="El panel muestra los recursos disponibles y lo que falta para el próximo nivel."
                    />
                    <Table
                        heads={["Nivel", "Miembros", "Por castillo", "Oro para subir", "Puntos Quest", "Materiales"]}
                    >
                        {clanLevels.map((level) => (
                            <tr key={level.level}>
                                <Cell>{level.level}</Cell>
                                <Cell>{level.maxMembers}</Cell>
                                <Cell>{level.castleLimit}</Cell>
                                <Cell>{level.level === 1 ? "Creación" : format(level.gold)}</Cell>
                                <Cell>{format(level.questPoints)}</Cell>
                                <Cell>
                                    {level.items.length
                                        ? level.items.map((item, i) => (
                                              <span key={item.idItem}>
                                                  {i ? ", " : ""}
                                                  {item.amount}{" "}
                                                  <Link
                                                      href={`/wiki/objetos/${item.idItem}`}
                                                      className="text-amber-200 underline"
                                                  >
                                                      {itemNames[item.idItem]}
                                                  </Link>
                                              </span>
                                          ))
                                        : "—"}
                                </Cell>
                            </tr>
                        ))}
                    </Table>
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                        El líder necesita nivel personal 30 y 150.000 de oro para fundar el clan. Para las mejoras, el
                        oro y los materiales salen de la bóveda compartida del clan; ciérrenla antes de comprar el
                        nivel. Desde nivel 2 se habilita el ataque a la Fortaleza, con los demás requisitos de
                        conquista.
                    </p>
                </WikiSection>
                <WikiSection title="Donaciones Quest y materiales">
                    <p className="text-sm leading-6 text-stone-300">
                        Todos los miembros pueden usar <strong>Donar puntos Quest</strong>. Elegí una cantidad entera
                        dentro de tu saldo y presioná Donar. El aporte queda en el clan y se usa para subirlo; los
                        puntos premium de donación son otra moneda.
                    </p>
                    <Capture
                        file="clan-donacion"
                        alt="Donación de puntos Quest al clan confirmada dentro del juego"
                        caption="Un miembro aporta desde su saldo personal; el saldo colectivo aparece en el panel del clan."
                    />
                    <Table heads={["Material", "Dónde conseguirlo", "Probabilidad base"]}>
                        <tr>
                            <Cell>Huevo Dragón</Cell>
                            <Cell>
                                <Link href="/wiki/npcs/739" className="text-amber-200">
                                    Dragón Infernal
                                </Link>{" "}
                                /{" "}
                                <Link href="/wiki/npcs/754" className="text-amber-200">
                                    Dragon Legendario
                                </Link>
                            </Cell>
                            <Cell>5% / 10%</Cell>
                        </tr>
                        <tr>
                            <Cell>Diamante Sangre</Cell>
                            <Cell>
                                <Link href="/wiki/npcs/761" className="text-amber-200">
                                    Rey Mago
                                </Link>{" "}
                                /{" "}
                                <Link href="/wiki/npcs/726" className="text-amber-200">
                                    Caballero de la Muerte
                                </Link>
                            </Cell>
                            <Cell>5% / 10%</Cell>
                        </tr>
                        <tr>
                            <Cell>Corazón Oscuro</Cell>
                            <Cell>
                                <Link href="/wiki/npcs/585" className="text-amber-200">
                                    Demonio de Fuego
                                </Link>{" "}
                                / Caballero de la Muerte
                            </Cell>
                            <Cell>5% / 5%</Cell>
                        </tr>
                    </Table>
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                        El Caballero de la Muerte aparece por evento cada 8 horas en el mapa 279. El Demonio de Fuego se
                        invoca en la sala del mapa 165. Cada drop exitoso entrega una unidad.
                    </p>
                    <Capture
                        file="clan-nivel-2"
                        alt="Clan de nivel 2 después de consumir los requisitos de la mejora"
                        caption="La mejora aumenta el cupo a 33 miembros y a 4 miembros simultáneos por castillo."
                    />
                </WikiSection>
            </div>
        );
    if (section === "combate")
        return (
            <div className="mt-6 space-y-6">
                <WikiSection title="Rangos de criaturas">
                    <p className="text-sm leading-6 text-stone-300">
                        Al aparecer, algunas criaturas hostiles del mundo pueden tener un rango especial. El nombre y el
                        color permiten reconocerlo. Cada nueva aparición vuelve a sortear el rango.
                    </p>
                    <Capture
                        file="npc-rangos"
                        alt="Criaturas de distintos rangos con sus nombres y vida en el juego"
                        caption="Un mismo tipo de criatura puede aparecer con más vida, daño y recompensa según su rango."
                    />
                    <Table heads={["Rango", "Frecuencia", "Vida", "Daño", "EXP y oro", "Chance de drop"]}>
                        {Object.entries(ranks).map(([key, rank]) => (
                            <tr key={key}>
                                <Cell>
                                    <span style={{ color: rank.color === "white" ? "#e7e5e4" : rank.color }}>
                                        {rank.label}
                                    </span>
                                </Cell>
                                <Cell>{rank.chancePerTenThousand / 100}%</Cell>
                                <Cell>×{rank.hp}</Cell>
                                <Cell>×{rank.damage}</Cell>
                                <Cell>×{rank.reward}</Cell>
                                <Cell>×{rank.drop}</Cell>
                            </tr>
                        ))}
                    </Table>
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                        El daño físico y mágico recibe el aumento. El bono de drop mejora la probabilidad hasta un
                        máximo de 100%; conserva la cantidad y la rareza del objeto. Los rangos no se aplican a
                        invocaciones, NPCs de servicio, jefes especiales, eventos, mazmorras ni zonas seguras o de
                        principiantes.
                    </p>
                </WikiSection>
                <WikiSection title="EXP, oro e inventario">
                    <p className="text-sm leading-6 text-stone-300">
                        La EXP base de criaturas se multiplica por 5 y el oro base por 3. El oro de las criaturas se
                        paga al morir y puede sumarse a sus drops monetarios adicionales. Los grupos y el equipo pueden
                        modificar el reparto.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-stone-300">
                        Los objetos del mismo tipo y la misma mejora se juntan en pilas de hasta 10.000. Rarezas
                        distintas conservan pilas separadas. Equipar y desequipar conserva la mejora y la cantidad.
                    </p>
                    <Capture
                        file="inventario-mejoras"
                        alt="Inventario que agrupa objetos de la misma mejora en una sola pila"
                        caption="La mochila suma las unidades compatibles y mantiene separadas las mejoras diferentes."
                    />
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                        Las misiones avanzadas exigen un nivel acorde a sus objetivos. Consultá el{" "}
                        <Link href="/wiki/misiones" className="text-amber-200 underline">
                            catálogo de misiones
                        </Link>{" "}
                        para ver el requisito y el premio actual. Una misión sólo consume los materiales cuando todos
                        sus premios caben en la mochila.
                    </p>
                </WikiSection>
            </div>
        );
    if (section === "competitivo")
        return (
            <div className="mt-6">
                <WikiSection title="Premios de ranked 1v1 y 2v2">
                    <p className="text-sm leading-6 text-stone-300">
                        Además del ELO, las partidas válidas dan puntos Quest para canjear o aportar al clan.
                    </p>
                    <Table heads={["Resultado", "Puntos Quest"]}>
                        <tr>
                            <Cell>Victoria</Cell>
                            <Cell>{rewards.ranked.win}</Cell>
                        </tr>
                        <tr>
                            <Cell>Derrota</Cell>
                            <Cell>{rewards.ranked.loss}</Cell>
                        </tr>
                        <tr>
                            <Cell>Primera victoria del día</Cell>
                            <Cell>+{rewards.ranked.firstWinBonus} adicionales</Cell>
                        </tr>
                    </Table>
                    <Capture
                        file="ranked-premio"
                        alt="Resultado ranked con premio de puntos Quest confirmado"
                        caption="La primera victoria válida del día acredita 20 puntos Quest: 8 por victoria y 12 de bonus."
                    />
                    <p className="mt-3 text-sm leading-6 text-stone-300">
                        En 2v2, la ronda continúa mientras quede un integrante del equipo vivo. Una resurrección
                        permite volver al combate. La serie termina al ganar dos rondas; al salir recuperás tu
                        equipo y la vida.
                    </p>
                    <Capture
                        file="ranked-2v2"
                        alt="Ranked 2v2 con una baja y marcador todavía en cero a cero"
                        caption="La primera baja no decide la ronda: el compañero sigue peleando."
                    />
                    <p className="mt-3 text-sm leading-6 text-stone-300">
                        Cada personaje puede recibir hasta {rewards.ranked.dailyCap} puntos por día entre ambos modos.
                        El día cambia a medianoche de Argentina. Como máximo se premian{" "}
                        {rewards.ranked.opponentMatchesPerDay} encuentros diarios contra una misma cuenta rival.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                        La partida debe durar al menos {rewards.ranked.minimumDurationSeconds} segundos, completar una
                        ronda y registrar acciones de combate del participante. Quien abandona no cobra; cuentas propias
                        en equipos rivales tampoco. Podés seguir jugando por ELO después de alcanzar el límite de
                        premios.
                    </p>
                </WikiSection>
            </div>
        );
    if (section === "eventos")
        return (
            <div className="mt-6">
                <WikiSection title="Premios Quest de eventos">
                    <p className="text-sm leading-6 text-stone-300">
                        Los premios Quest requieren participación efectiva. Un cierre repetido de la misma edición no
                        paga de nuevo. Los eventos cancelados no entregan premio de finalización.
                    </p>
                    <Table heads={["Evento", "Premio Quest", "Condición"]}>
                        <tr>
                            <Cell>Torneo automático</Cell>
                            <Cell>
                                Campeón: {rewards.tournament.championBase} + {rewards.tournament.perAccount} por cuenta
                                (bonus máximo {rewards.tournament.maximumBonus}); finalista:{" "}
                                {rewards.tournament.finalist}
                            </Cell>
                            <Cell>
                                Al menos {rewards.tournament.minimumAccounts} cuentas distintas. El campeón conserva su
                                objeto de premio, con entrega pendiente si no tiene espacio.
                            </Cell>
                        </tr>
                        <tr>
                            <Cell>Hunters Game</Cell>
                            <Cell>
                                {rewards.huntersGame.kill} por baja; campeón: {rewards.huntersGame.championBase} +{" "}
                                {rewards.huntersGame.perAccount} por cuenta
                            </Cell>
                            <Cell>
                                Al menos {rewards.huntersGame.minimumAccounts} cuentas. Una baja premiada por cuenta
                                víctima y edición. Conserva el oro del evento.
                            </Cell>
                        </tr>
                        <tr>
                            <Cell>Blood Castle</Cell>
                            <Cell>
                                {rewards.bloodCastle.survivor} + {rewards.bloodCastle.completionBonus} por completar a
                                tiempo
                            </Cell>
                            <Cell>Sobrevivir, participar y derrotar al guardián y a Archavon dentro del evento.</Cell>
                        </tr>
                        <tr>
                            <Cell>Guerra de facciones</Cell>
                            <Cell>
                                Ganadores: {rewards.factionWar.win}; perdedores activos: {rewards.factionWar.loss}; cada
                                MVP: +{rewards.factionWar.mvp}
                            </Cell>
                            <Cell>Conserva los puntos de facción. AFK y expulsados no cobran.</Cell>
                        </tr>
                    </Table>
                    <Capture
                        file="evento-premio"
                        alt="Evento terminado con puntos Quest acreditados al participante"
                        caption="Los puntos del evento se agregan al mismo saldo Quest que usan las misiones, los canjes y los aportes al clan."
                    />
                    <Capture
                        file="torneo-premio"
                        alt="Campeón del torneo automático con puntos Quest acreditados"
                        caption="En el torneo sólo podés atacar a tu rival de turno, incluso si pertenece a tu clan."
                    />
                    <Capture
                        file="hunters-premio"
                        alt="Hunters Game terminado y premio del último superviviente"
                        caption="Hunters comienza con dos minutos seguros para buscar cofres. Después se habilita el combate."
                    />
                    <Capture
                        file="guerra-premio"
                        alt="Resultado de una guerra de facciones y premios por victoria y MVP"
                        caption="La guerra dura cinco minutos. El resultado y los MVP determinan los premios de los participantes activos."
                    />
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                        Los Juegos del Hambre antiguos están deshabilitados y fueron reemplazados por Hunters Game. Los
                        puntos Quest y los puntos premium de donación son monedas diferentes.
                    </p>
                </WikiSection>
            </div>
        );
    return null;
}
