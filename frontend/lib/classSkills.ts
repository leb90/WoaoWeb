// Las habilidades que muestra la creación de personaje al elegir una clase: las más importantes de cada una, con un
// video corto que se repite (lo graba teaser/habilidades.ts con el juego real: un bot de la clase contra un muñeco).
// Los números salen de server/jsons/spells.json; si cambian ahí, cambiarlos acá.
import type { CharacterClassKey } from "./characterCreation";

export type ClassSkill = {
    /** El nombre del archivo: /static/clases/<clase>/<id>.mp4 y .jpg. */
    id: string;
    nombre: string;
    descripcion: string;
};

export const CLASS_SKILLS: Partial<Record<CharacterClassKey, ClassSkill[]>> = {
    mago: [
        { id: "llama-de-dragon", nombre: "Llama de Dragón", descripcion: "Su hechizo más fuerte: de 60 a 65 de daño a distancia." },
        { id: "implosion", nombre: "Implosión", descripcion: "Estalla alrededor del mago y daña a todos los que tiene cerca." },
        { id: "paralizar", nombre: "Paralizar", descripcion: "Deja quieta a la víctima por un momento, para escapar o para rematarla." },
    ],
    clerigo: [
        { id: "purificar", nombre: "Purificar", descripcion: "De 58 a 63 de daño, y el clérigo recupera la mitad como vida." },
        { id: "martillo-de-luz", nombre: "Martillo de luz celestial", descripcion: "Daño mágico desde lejos: de 55 a 60." },
        { id: "curacion-divina", nombre: "Curación Divina", descripcion: "Cura de 100 a 120 de vida, a sí mismo o a un aliado." },
    ],
    guerrero: [
        { id: "golpes-pesados", nombre: "Golpes pesados", descripcion: "Pelea cuerpo a cuerpo con armas pesadas: su fuerte es pegar y aguantar." },
        { id: "pocion-de-fuerza", nombre: "Poción de fuerza", descripcion: "Le sube la fuerza por un rato, y con ella el daño de cada golpe." },
    ],
    asesino: [
        { id: "apunalar", nombre: "Apuñalar", descripcion: "Desde atrás, la daga a veces pega el doble; a los jugadores además los deja desangrándose." },
        { id: "destello-infernal", nombre: "Destello infernal", descripcion: "Daño mágico a distancia: de 54 a 59." },
        { id: "invisibilidad", nombre: "Invisibilidad", descripcion: "Se vuelve invisible por un rato, para acercarse o para escapar." },
    ],
    bardo: [
        { id: "apocalipsis", nombre: "Apocalipsis", descripcion: "De 50 a 55 de daño mágico a distancia." },
        { id: "inmovilizar", nombre: "Inmovilizar", descripcion: "Deja quieta a la víctima por un momento." },
        { id: "curacion-milagrosa", nombre: "Curación Milagrosa", descripcion: "Cura de 85 a 105 de vida." },
    ],
    druida: [
        { id: "enredar", nombre: "Enredar", descripcion: "Atrapa a la víctima con raíces por un momento. No gasta maná." },
        { id: "lluvia-de-sangre", nombre: "Lluvia de Sangre", descripcion: "De 55 a 60 de daño mágico a distancia." },
        { id: "lluvia-arcana", nombre: "Lluvia Arcana", descripcion: "De 50 a 56 de daño mágico, casi tanto como un mago." },
    ],
    paladin: [
        { id: "arma-y-escudo", nombre: "Arma y escudo", descripcion: "Pelea cuerpo a cuerpo con escudo: aguanta mucho y pega fuerte." },
        { id: "restauracion", nombre: "Restauración", descripcion: "Cura de 90 a 110 de vida." },
        { id: "apocalipsis", nombre: "Apocalipsis", descripcion: "De 50 a 55 de daño mágico a distancia." },
    ],
    cazador: [
        { id: "disparo", nombre: "Arco y flechas", descripcion: "Ataca desde lejos y aguanta más que un arquero." },
        { id: "ocultarse", nombre: "Ocultarse", descripcion: "Se esconde y desaparece de la vista; el cazador aguanta escondido más que las otras clases." },
    ],
    pirata: [
        { id: "disparo-certero", nombre: "Disparo Certero", descripcion: "Su ataque más fuerte: de 105 a 115 de daño." },
        { id: "disparo-de-conmocion", nombre: "Disparo de Conmoción", descripcion: "Deja quieta a la víctima por un momento." },
        { id: "sable", nombre: "Sable y hacha", descripcion: "Cuerpo a cuerpo pega y aguanta casi como un guerrero." },
    ],
    arquero: [
        { id: "disparo", nombre: "Arco y flechas", descripcion: "El que más daño hace con arco y flechas, pero tiene poca vida." },
        { id: "a-distancia", nombre: "Siempre a distancia", descripcion: "No pelea cuerpo a cuerpo: se aleja y sigue disparando." },
    ],
    chaman: [
        { id: "ventisca", nombre: "Ventisca", descripcion: "De 55 a 60 de daño a todos en una cruz de 5 baldosas." },
        { id: "rayo-de-fuego", nombre: "Rayo de Fuego", descripcion: "Prende fuego a la víctima: le saca 10 de vida cada 3 s hasta que se cure." },
        { id: "escudo-de-energia", nombre: "Escudo de energía", descripcion: "Por 30 s, cada 2 s una piedra golpea a quien atacaste." },
    ],
};

export function classSkillMedia(clase: CharacterClassKey, skill: ClassSkill) {
    const base = `/static/clases/${clase}/${skill.id}`;
    return { video: `${base}.mp4`, poster: `${base}.jpg` };
}
