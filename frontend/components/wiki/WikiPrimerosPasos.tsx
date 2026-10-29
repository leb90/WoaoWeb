import { WikiSection } from "@/components/wiki/WikiUi";

const CONTROLS: Array<{ key: string; action: string }> = [
    { key: "W A S D o flechas", action: "Moverse" },
    { key: "Clic", action: "Mirar el suelo, abrir puertas y hablar con un NPC" },
    { key: "Q", action: "Agarrar lo que hay en el piso" },
    { key: "Espacio", action: "Atacar al frente, o apuntar si el arma es a distancia" },
    { key: "E", action: "Equipar el ítem seleccionado" },
    { key: "U", action: "Usar el ítem seleccionado" },
    { key: "T", action: "Tirar el ítem seleccionado" },
    { key: "H", action: "Lanzar el hechizo seleccionado" },
    { key: "N", action: "Meditar" },
    { key: "K", action: "Activar o desactivar el seguro" },
    { key: "J", action: "Activar o desactivar el seguro de clan" },
    { key: "O", action: "Intentar ocultarse" },
    { key: "M", action: "Abrir o cerrar el mapa del mundo" },
    { key: "Enter", action: "Abrir el chat" },
    { key: "Esc", action: "Cerrar el chat o cancelar el apuntado" },
];

function Prose({ children }: { children: React.ReactNode }) {
    return <div className="space-y-3 text-sm leading-6 text-stone-300">{children}</div>;
}

function GuideFigure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
    return (
        <figure className="mt-4 overflow-hidden border border-amber-200/15 bg-black">
            <img src={src} alt={alt} className="w-full" />
            <figcaption className="border-t border-amber-200/10 px-3 py-2 text-xs leading-5 text-stone-500">
                {caption}
            </figcaption>
        </figure>
    );
}

export default function WikiPrimerosPasos() {
    return (
        <div className="mt-6 space-y-4">
            <WikiSection title="Cuenta">
                <Prose>
                    <p>
                        La cuenta se crea en Registrate. Pedís un nombre de usuario, un email y una contraseña de 8 a 100 caracteres, y la confirmás. El nombre de usuario lleva entre 3 y 15 caracteres, solo letras de la A a la Z y espacios. Ese nombre es el que se muestra por defecto en Arenas.
                    </p>
                    <GuideFigure
                        src="/wiki/primeros-pasos/crear-cuenta.png"
                        alt="Formulario de crear cuenta con nombre Aldric, email aldric@correo.com y una contraseña de ejemplo"
                        caption="Ejemplo de alta. Aldric, aldric@correo.com y Ejemplo123 cumplen las reglas del nombre y de la contraseña."
                    />
                    <p>
                        Para entrar usás el email o el nombre de usuario, más la contraseña. Si la olvidás, Olvidé mi contraseña manda un enlace al email de la cuenta. Un email o un nombre que ya existen no se pueden volver a registrar.
                    </p>
                    <GuideFigure
                        src="/wiki/primeros-pasos/iniciar-sesion.png"
                        alt="Formulario de iniciar sesión con email y contraseña de ejemplo"
                        caption="El ingreso acepta el email o el nombre de usuario. Olvidé mi contraseña recupera el acceso por correo."
                    />
                </Prose>
            </WikiSection>

            <WikiSection title="Personaje">
                <Prose>
                    <p>
                        Después de entrar vas a Selección de personaje y elegís Crear personaje. El nombre del personaje sigue las mismas reglas que el de la cuenta y tiene que estar libre. La cuenta y el personaje son dos nombres distintos.
                    </p>
                    <GuideFigure
                        src="/wiki/primeros-pasos/seleccion-personaje.jpg"
                        alt="Pantalla de selección de personaje, con el botón Crear personaje"
                        caption="Desde Personajes elegís uno para entrar o creás otro."
                    />
                    <p>
                        Elegís facción al elegir raza. Alianza: Humano, Elfo, Enano, Gnomo, Tauros y Abisario. Horda: Elfo Oscuro, Orco, Vampiro, Goblin, Licantropo y No-Muerto. Todas tienen hombre y mujer, y una cabeza dentro del rango de esa raza.
                    </p>
                    <p>
                        Las clases que se pueden crear son Mago, Clerigo, Guerrero, Asesino, Bardo, Druida, Paladin, Cazador, Pirata, Arquero y Chamán. Ninguna raza bloquea a ninguna de esas clases. Ladrón, Bandido, Ermitaño y Domador no se pueden crear.
                    </p>
                    <p>
                        Cada atributo arranca en 18 y suma el bono de la raza. La clase cambia en el momento el acierto, el daño, la evasión, la defensa y el maná que ves en la pantalla. El personaje nace en nivel 1, con 0 de oro, en la zona Dungeon Newbie. En el mundo ese mapa se llama Newbie Dungeon.
                    </p>
                    <GuideFigure
                        src="/wiki/primeros-pasos/crear-personaje.jpg"
                        alt="Pantalla de creación con Alianza y Horda, vista del personaje, atributos y clase Mago"
                        caption="Raza, sexo, cabeza, clase y atributos se eligen en esta pantalla. La zona inicial es Dungeon Newbie."
                    />
                    <p>
                        Todos salen con una Daga (Newbies 1-3) equipada, ropa newbie según la raza y el sexo, 100 Manzana Roja (Newbies) y 100 Botella de agua (Newbies). El 1-3 del nombre de la daga es su daño, no un tope de nivel. Arquero y Cazador además reciben un Arco Newbie y 500 Flecha Newbie. Mago, Clerigo, Bardo, Druida, Paladin y Asesino empiezan con el hechizo Dardo Mágico, y el Chamán con Flecha eléctrica.
                    </p>
                </Prose>
            </WikiSection>

            <WikiSection title="Controles">
                <Prose>
                    <p>
                        Estas son las teclas de fábrica. Se cambian desde el menú del personaje, en Teclas. Para equipar, usar o tirar, primero seleccioná el ítem del inventario. Para lanzar, seleccioná el hechizo. La tecla H no se puede reasignar.
                    </p>
                    <GuideFigure
                        src="/wiki/primeros-pasos/controles-mundo.jpg"
                        alt="Mundo del juego con la consola, el seguro activado y las coordenadas del mapa"
                        caption="El mundo se recorre con W A S D o las flechas. Seguro: ON es el estado al entrar. Abajo a la derecha está el mapa y la posición."
                    />
                </Prose>
                <dl className="mt-4 grid gap-px border border-amber-200/12 bg-amber-200/12 sm:grid-cols-2">
                    {CONTROLS.map((entry) => (
                        <div key={entry.key} className="flex gap-3 bg-[#0a0806] px-3 py-2">
                            <dt className="w-36 shrink-0 font-medium text-amber-100">{entry.key}</dt>
                            <dd className="text-sm text-stone-400">{entry.action}</dd>
                        </div>
                    ))}
                </dl>
                <Prose>
                    <p className="mt-4">
                        El clic sobre un NPC cercano abre su diálogo. Si es comerciante, banco, sacerdote o viajero, también abre ese servicio. El clic sobre un objeto del piso escribe el nombre y la cantidad en la consola. Q lo levanta.
                    </p>
                    <p>
                        Espacio pega en el casillero de enfrente. Si tenés un arco equipado, Espacio o U inician el apuntado a distancia. Hay que dejar de meditar para atacar, equipar o usar algo.
                    </p>
                    <p>
                        Cada vez que entrás, el seguro queda activado. Con el seguro puesto no podés atacar ciudadanos: la consola te avisa que K lo desactiva y que al hacerlo te convertís en criminal. J es el seguro contra los compañeros de clan, y solo aplica si ya tenés clan.
                    </p>
                </Prose>
            </WikiSection>

            <WikiSection title="Interfaz">
                <Prose>
                    <p>
                        El mundo ocupa la pantalla. Abajo está la consola, con las pestañas Consola, Global, Party, Clan y Privados. Enter abre el chat de la pestaña activa y Esc lo cierra. Al lado de las pestañas podés ocultar o mostrar el minimapa.
                    </p>
                    <GuideFigure
                        src="/wiki/primeros-pasos/interfaz.jpg"
                        alt="Interfaz de juego con consola, minimapa, inventario, barras de vida y el panel del personaje"
                        caption="Consola y minimapa a la izquierda. A la derecha, inventario, hechizos, energía, vida, maná, hambre y sed."
                    />
                    <p>
                        El minimapa marca tu posición sobre la imagen del mapa. Abajo a la derecha ves el número de mapa y las coordenadas X e Y. M abre el mapa del mundo.
                    </p>
                    <p>
                        El panel del personaje muestra energía, vida, maná, hambre y sed, el inventario y los hechizos. La barra de macros tiene ocho lugares vacíos: a cada uno le podés asignar un ítem o un hechizo y una tecla.
                    </p>
                </Prose>
            </WikiSection>

            <WikiSection title="Primeros niveles">
                <Prose>
                    <p>
                        Desde el nivel 1 hasta el 12 el nombre lleva [NEWBIE]. En el nivel 13 dejás de serlo. La consola avisa: “Al llegar a nivel 13 dejaste de ser newbie, se eliminaron tus objetos newbie del inventario.” Se desequipan y se borran, también la daga, la ropa, la comida y las flechas de newbie. Si estabas pescando o recolectando con una herramienta newbie, esa acción se cancela.
                    </p>
                    <GuideFigure
                        src="/wiki/primeros-pasos/primeros-niveles.jpg"
                        alt="Panel de un personaje nivel 1 en Newbie Dungeon, con manzanas, agua, daga y ropa newbie"
                        caption="Nivel 1 en Newbie Dungeon, con 0 de oro. En el inventario: 100 manzanas, 100 botellas de agua, la daga y la ropa, las dos últimas equipadas."
                    />
                    <p>
                        Mientras seas newbie podés equipar y usar esos objetos. No se pueden tirar, subastar ni publicar en el mercado, y no se caen al morir. Desde el nivel 13 el juego rechaza equiparlos o usarlos.
                    </p>
                    <p>
                        Matar a un newbie no suma a los ciudadanos ni a los criminales matados, y tampoco cuenta para el puntaje de facción. Ser newbie no impide que te ataquen.
                    </p>
                    <p>
                        Hambre y sed empiezan en 100 y bajan 1 punto cada 16 segundos. Si una de las dos llega a 0, perdés un 10% de tu vida máxima y ese tope se mantiene hasta que comas y bebas. Si las dos llegan a 0, la energía baja en vez de regenerarse. La manzana recupera hambre y la botella recupera sed: seleccionalas y apretá U.
                    </p>
                    <p>
                        La vestimenta abriga. Sin vestimenta y con menos de 15 °C, hambre y sed bajan cada 6,5 segundos. Con 0 °C o menos perdés un 5% de tu vida máxima cada 5 segundos, aunque el frío nunca te deja por debajo de 1 de vida. La temperatura del mapa aparece en el panel: los mapas de nieve, como el Polo, son mucho más fríos, y la lluvia y la nieve enfrían un poco más.
                    </p>
                    <p>
                        Cada mapa puede pedir un nivel mínimo o máximo. Si no cumplís el requisito, la consola te lo dice y el personaje vuelve a Ullathorpe. El Newbie Dungeon no tiene ese límite: es el punto de partida y también el hogar del personaje nuevo.
                    </p>
                </Prose>
            </WikiSection>
        </div>
    );
}
