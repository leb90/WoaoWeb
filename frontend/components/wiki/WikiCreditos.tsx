import { WikiSection } from "@/components/wiki/WikiUi";
import {
    DUNGEON_MUSIC_CREDITS,
    LICENSE_LINKS,
    MENU_MUSIC_CREDITS,
    WORLD_MUSIC_CREDITS,
    type MusicCredit,
} from "@/lib/musicCredits";

// Créditos de la música de otros autores (lib/musicCredits.ts). Las licencias CC BY piden que se vean.

function CreditsTable({ credits }: { credits: MusicCredit[] }) {
    return (
        <div className="overflow-x-auto border border-amber-200/12">
            <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-amber-200/[0.035] text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                    <tr>
                        <th className="px-4 py-2">Dónde suena</th>
                        <th className="px-4 py-2">Tema</th>
                        <th className="px-4 py-2">Autor</th>
                        <th className="px-4 py-2">Licencia</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/10">
                    {credits.map((credit) => (
                        <tr key={`${credit.uso}-${credit.titulo}`} className="bg-black/20">
                            <td className="px-4 py-2 text-stone-400">{credit.uso}</td>
                            <td className="px-4 py-2">
                                <a href={credit.enlace} target="_blank" rel="noreferrer" className="text-stone-100 hover:text-amber-200">
                                    {credit.titulo}
                                </a>
                            </td>
                            <td className="px-4 py-2 text-stone-300">{credit.autor}</td>
                            <td className="px-4 py-2">
                                <a href={LICENSE_LINKS[credit.licencia]} target="_blank" rel="noreferrer" className="text-amber-200/80 hover:text-amber-100">
                                    {credit.licencia}
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function WikiCreditos() {
    return (
        <div className="mt-6 space-y-6">
            <p className="max-w-3xl text-sm leading-6 text-stone-400">
                La música del juego es de compositores que la comparten con licencias libres. Gracias a Alexander Nakarada
                (CreatorChords), Scott Buckley, Kevin MacLeod (incompetech.com) y a los autores de OpenGameArt. Los temas se
                convirtieron a MP3 y se nivelaron de volumen; algunos tienen recortados los silencios de las puntas.
            </p>
            <WikiSection title="Música del mundo">
                <CreditsTable credits={WORLD_MUSIC_CREDITS} />
            </WikiSection>
            <WikiSection title="Inicio y creación de personaje">
                <CreditsTable credits={MENU_MUSIC_CREDITS} />
            </WikiSection>
            <WikiSection title="Mazmorras">
                <CreditsTable credits={DUNGEON_MUSIC_CREDITS} />
            </WikiSection>
        </div>
    );
}
