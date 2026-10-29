# Balance de combate

Modelo generado desde los datos efectivos del servidor. Nivel de comparacion: 50.

## Reglas centrales

- La vida por nivel es una tirada entera persistente. Iniciar sesion o recargar balance no vuelve a calcularla.
- Constitucion mueve el promedio 0,5 por punto respecto de CON 21.
- El equipo suma hasta 90 de dano magico bruto con 50% de efectividad (45 efectivo), 15% porcentual y 20 de penetracion.
- La resistencia magica porcentual se limita a 60%; la defensa magica plana se aplica despues.
- Las monturas aportan hasta 5% de dano PvP y hasta 10% de defensa/PvE segun sus talentos.
- Ninguna curacion de jugador puede superar 120 HP por lanzamiento.

## Logica de combate

- Acierto fisico: `clamp(50 + (ataque - evasion) * 0,4)`.
- Dano fisico: `floor((3 * golpeArma + (maxArma / 5) * max(0, fuerza - 15) + golpePersonaje) * modClase)`.
- La armadura o casco y el escudo absorben despues del golpe; las pasivas raciales y la montura se aplican una sola vez.
- Dano magico: hechizo con escala de nivel 2%, equipo plano al 50%, porcentaje, modificador de clase y montura PvP.
- La defensa magica combina resistencia de equipo, clase, raza y skills; penetracion resta antes del limite de 60%.
- El dano adicional independiente de la mascota solo se aplica contra NPC; en PvP la montura queda limitada a 5%.

## Rango base por clase (CON 21)

| Clase | Min | Promedio | Max |
|---|---:|---:|---:|
| Mago | 6 | 8 | 10 |
| Clerigo | 7 | 8.5 | 10 |
| Guerrero | 9 | 11 | 13 |
| Asesino | 7 | 9 | 11 |
| Ladron | 8 | 10 | 12 |
| Bardo | 7 | 9 | 11 |
| Druida | 7 | 8.5 | 10 |
| Paladin | 8 | 10 | 12 |
| Cazador | 8 | 10 | 12 |
| Bandido | 7 | 9 | 11 |
| Pescador | 6 | 8 | 10 |
| Herrero | 6 | 8 | 10 |
| Lenador | 6 | 8 | 10 |
| Minero | 6 | 8 | 10 |
| Carpintero | 6 | 8 | 10 |
| Pirata | 8 | 10 | 12 |
| Ermitano | 7 | 8.5 | 10 |
| Arquero | 6 | 8 | 10 |
| Domador | 7 | 9 | 11 |

## Modificadores por clase

Los valores de dano, evasion y escudo son multiplicadores efectivos del servidor.

| Clase | Mana 50 (INT 21) | Dano arma | Dano proyectil | Dano magico | Evasion | Escudo | Resist. magica |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mago | 2902 | 0.5 | 0.5 | 1.05 | 0.35 | 0 | 0% |
| Clerigo | 2111 | 0.85 | 0.75 | 0.88 | 0.8 | 0.8 | 4% |
| Guerrero | 0 | 1.05 | 0.87 | 0 | 1 | 1 | 12% |
| Asesino | 1082 | 0.95 | 0.75 | 0.76 | 0.9 | 0.8 | 5% |
| Ladron | 0 | 0.8 | 0.75 | 0 | 1.1 | 0.7 | 4% |
| Bardo | 2111 | 0.82 | 0.75 | 0.93 | 1 | 0.65 | 2% |
| Druida | 2111 | 0.75 | 0.75 | 0.92 | 0.9 | 0 | 3% |
| Paladin | 1082 | 1 | 0.8 | 0.78 | 0.85 | 0.9 | 5% |
| Cazador | 0 | 0.85 | 0.93 | 0 | 0.9 | 0.75 | 6% |
| Bandido | 0 | 0.9 | 0.8 | 0 | 0.7 | 0.7 | 4% |
| Pescador | 0 | 0.8 | 0.7 | 0 | 0.8 | 0.7 | 4% |
| Herrero | 0 | 0.8 | 0.7 | 0 | 0.8 | 0.7 | 4% |
| Lenador | 0 | 0.8 | 0.6 | 0 | 0.8 | 0.7 | 4% |
| Minero | 0 | 0.8 | 0.7 | 0 | 0.8 | 0.7 | 4% |
| Carpintero | 0 | 0.8 | 0.7 | 0 | 0.8 | 0.7 | 4% |
| Pirata | 0 | 0.95 | 0.8 | 0 | 1.25 | 0 | 6% |
| Ermitano | 1082 | 0.8 | 0.75 | 0.5 | 0.8 | 0.7 | 4% |
| Arquero | 0 | 0.5 | 1.1 | 0 | 0.8 | 0.6 | 4% |
| Domador | 0 | 0.5 | 0.5 | 0 | 0.8 | 0.6 | 4% |

## Atributos por raza

| Raza | Fuerza | Agilidad | Inteligencia | Constitucion | Carisma |
|---|---:|---:|---:|---:|---:|
| Humano | 19 | 19 | 20 | 20 | 18 |
| Elfo | 18 | 20 | 21 | 19 | 18 |
| Elfo Drow | 19 | 20 | 19 | 19 | 18 |
| Enano | 20 | 19 | 18 | 20 | 18 |
| Gnomo | 17 | 19 | 22 | 20 | 18 |
| Orco | 20 | 19 | 18 | 20 | 18 |
| Vampiro | 18 | 20 | 21 | 19 | 18 |
| Abisario | 20 | 20 | 17 | 19 | 18 |
| Goblin | 17 | 19 | 22 | 20 | 18 |
| Tauros | 19 | 20 | 19 | 19 | 18 |
| Licantropo | 20 | 20 | 17 | 19 | 18 |
| No-Muerto | 19 | 19 | 20 | 20 | 18 |

## Caso de control: Mago Elfo

- Vida nivel 50: 264-460, promedio 362.
- Mana nivel 50: 2902. Llama de Dragon cuesta 1000.
- Para tres Llamas de Dragon necesita 1 azul comun (141 de mana efectivo) antes del tercer lanzamiento.
- Llama de Dragon con equipo y montura al limite: 181-192 antes de la resistencia del objetivo.

| Objetivo Elfo | HP promedio | Resist. clase | Dano por Llama de Dragon | Impactos promedio |
|---|---:|---:|---:|---:|
| Mago | 362 | 0% | 181-192 | 2 |
| Clerigo | 387 | 4% | 174-185 | 3 |
| Druida | 387 | 3% | 176-187 | 3 |
| Bardo | 411 | 2% | 178-189 | 3 |
| Paladin | 460 | 5% | 172-183 | 3 |

## Hechizos principales por clase

La identidad se obtiene de los objetos-pergamino de `old/OBJ.dat`, no solo del dano nominal del hechizo.
Incinerar usa el FX 113, etiquetado como Lluvia de Fuego en `old/Fx.dat`.

| Clase | Hechizo actual | Objeto | Dano actual | Mana actual | Referencia old (dano / mana) | Funcion |
|---|---|---:|---:|---:|---:|---|
| Mago | Llama de Dragon (#45) | #821 | 60-65 | 1000 | 105-110 / 1000 | Exclusivo; mejor ataque individual. |
| Druida | Incinerar (#61) | #1214 | 58-63 | 1050 | 100-105 / 840 | Incinerar; el FX 113 figura como Lluvia de Fuego en old. |
| Clerigo | Purificar (#75) | #1396 | 58-63 | 1500 | 85-100 / 1500 | Exclusivo; devuelve parte del dano causado. |
| Asesino | Destello infernal (#73) | #1290 | 54-59 | 950 | 80-85 / 640 | Exclusivo. |
| Bardo | Apocalipsis (#25) | #532 | 50-55 | 950 | 80-85 / 640 | Mejor ataque individual disponible para la clase. |
| Paladin | Apocalipsis (#25) | #532 | 50-55 | 950 | 80-85 / 640 | Mejor ataque individual disponible para la clase. |

Implosion (#41) sigue disponible solo para Mago y Druida como ataque de area: no reemplaza al hechizo principal individual. En old costaba 2000 de mana; actualmente cuesta 1800. No existe en old una receta aprendible exclusiva de Druida que cueste 1400 de mana.

## Auditoria de equipo

- Armas analizadas: 240. Mayor golpe maximo de arma: 48.
- Armaduras analizadas: 489. Mayor defensa maxima: 80.
- Espada MataDragones conserva su muerte instantanea contra NPC dragon, pero usa 35-48 contra jugadores y otros objetivos.
- Los bonus magicos de sets se suman una sola vez y luego se limitan; ya no se multiplican secuencialmente por item.

## Curaciones

| ID | Hechizo | Curacion | Mana |
|---:|---|---:|---:|
| 3 | Curar Heridas Leves | 5-12 | 30 |
| 5 | Curar heridas graves | 35-55 | 160 |
| 32 | Curación Milagrosa | 85-105 | 520 |
| 39 | Curacion Divina | 100-120 | 700 |
| 42 | Curar Heridas Críticas | 55-75 | 260 |
| 60 | Restauración | 90-110 | 600 |

## Pociones de combate

| ID | Pocion | Recurso | Recuperacion declarada |
|---:|---|---|---:|
| 37 | Poción Azul | Mana | 12-20 |
| 38 | Poción Roja | Vida | 30-30 |

El balance utiliza exclusivamente pociones normales. La azul comun conserva su recuperacion dinamica por nivel y mana maximo; cualquier pocion mejorada o super heredada queda limitada al mismo efecto normal. Los NPC ya no entregan esas variantes heredadas.

## Vida nivel 50 por clase y raza

### Mago
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Elfo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Elfo Drow | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Enano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Gnomo | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Orco | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Vampiro | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Abisario | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Goblin | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Tauros | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Licantropo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| No-Muerto | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |

### Clerigo
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Elfo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Elfo Drow | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Enano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Gnomo | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Orco | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Vampiro | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Abisario | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Goblin | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Tauros | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Licantropo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| No-Muerto | 20 | 6 | 8 | 10 | 314 | 412 | 510 |

### Guerrero
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 8 | 10.5 | 13 | 412 | 535 | 657 |
| Elfo | 19 | 8 | 10 | 12 | 411 | 509 | 607 |
| Elfo Drow | 19 | 8 | 10 | 12 | 411 | 509 | 607 |
| Enano | 20 | 8 | 10.5 | 13 | 412 | 535 | 657 |
| Gnomo | 20 | 8 | 10.5 | 13 | 412 | 535 | 657 |
| Orco | 20 | 8 | 10.5 | 13 | 412 | 535 | 657 |
| Vampiro | 19 | 8 | 10 | 12 | 411 | 509 | 607 |
| Abisario | 19 | 8 | 10 | 12 | 411 | 509 | 607 |
| Goblin | 20 | 8 | 10.5 | 13 | 412 | 535 | 657 |
| Tauros | 19 | 8 | 10 | 12 | 411 | 509 | 607 |
| Licantropo | 19 | 8 | 10 | 12 | 411 | 509 | 607 |
| No-Muerto | 20 | 8 | 10.5 | 13 | 412 | 535 | 657 |

### Asesino
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Elfo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Elfo Drow | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Enano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Gnomo | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Orco | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Vampiro | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Abisario | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Goblin | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Tauros | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Licantropo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| No-Muerto | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |

### Ladron
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Elfo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Elfo Drow | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Enano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Gnomo | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Orco | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Vampiro | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Abisario | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Goblin | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Tauros | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Licantropo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| No-Muerto | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |

### Bardo
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Elfo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Elfo Drow | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Enano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Gnomo | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Orco | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Vampiro | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Abisario | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Goblin | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Tauros | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Licantropo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| No-Muerto | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |

### Druida
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Elfo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Elfo Drow | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Enano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Gnomo | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Orco | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Vampiro | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Abisario | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Goblin | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Tauros | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Licantropo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| No-Muerto | 20 | 6 | 8 | 10 | 314 | 412 | 510 |

### Paladin
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Elfo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Elfo Drow | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Enano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Gnomo | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Orco | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Vampiro | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Abisario | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Goblin | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Tauros | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Licantropo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| No-Muerto | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |

### Cazador
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Elfo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Elfo Drow | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Enano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Gnomo | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Orco | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Vampiro | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Abisario | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Goblin | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Tauros | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Licantropo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| No-Muerto | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |

### Bandido
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Elfo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Elfo Drow | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Enano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Gnomo | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Orco | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Vampiro | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Abisario | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Goblin | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Tauros | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Licantropo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| No-Muerto | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |

### Pescador
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Elfo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Elfo Drow | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Enano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Gnomo | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Orco | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Vampiro | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Abisario | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Goblin | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Tauros | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Licantropo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| No-Muerto | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |

### Herrero
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Elfo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Elfo Drow | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Enano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Gnomo | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Orco | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Vampiro | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Abisario | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Goblin | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Tauros | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Licantropo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| No-Muerto | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |

### Lenador
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Elfo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Elfo Drow | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Enano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Gnomo | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Orco | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Vampiro | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Abisario | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Goblin | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Tauros | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Licantropo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| No-Muerto | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |

### Minero
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Elfo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Elfo Drow | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Enano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Gnomo | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Orco | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Vampiro | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Abisario | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Goblin | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Tauros | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Licantropo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| No-Muerto | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |

### Carpintero
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Elfo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Elfo Drow | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Enano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Gnomo | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Orco | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Vampiro | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Abisario | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Goblin | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Tauros | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Licantropo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| No-Muerto | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |

### Pirata
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Elfo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Elfo Drow | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Enano | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Gnomo | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Orco | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Vampiro | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Abisario | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Goblin | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |
| Tauros | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| Licantropo | 19 | 7 | 9 | 11 | 362 | 460 | 558 |
| No-Muerto | 20 | 7 | 9.5 | 12 | 363 | 486 | 608 |

### Ermitano
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Elfo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Elfo Drow | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Enano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Gnomo | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Orco | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Vampiro | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Abisario | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Goblin | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Tauros | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Licantropo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| No-Muerto | 20 | 6 | 8 | 10 | 314 | 412 | 510 |

### Arquero
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Elfo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Elfo Drow | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Enano | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Gnomo | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Orco | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Vampiro | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Abisario | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Goblin | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |
| Tauros | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| Licantropo | 19 | 5 | 7 | 9 | 264 | 362 | 460 |
| No-Muerto | 20 | 5 | 7.5 | 10 | 265 | 388 | 510 |

### Domador
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Elfo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Elfo Drow | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Enano | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Gnomo | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Orco | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Vampiro | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Abisario | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Goblin | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |
| Tauros | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| Licantropo | 19 | 6 | 8 | 10 | 313 | 411 | 509 |
| No-Muerto | 20 | 6 | 8.5 | 11 | 314 | 437 | 559 |

### Chaman
| Raza | CON | Vida/nivel min | Promedio | Max | HP 50 min | HP 50 promedio | HP 50 max |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Elfo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Elfo Drow | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Enano | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Gnomo | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Orco | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Vampiro | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Abisario | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Goblin | 20 | 6 | 8 | 10 | 314 | 412 | 510 |
| Tauros | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| Licantropo | 19 | 6 | 7.5 | 9 | 313 | 387 | 460 |
| No-Muerto | 20 | 6 | 8 | 10 | 314 | 412 | 510 |

