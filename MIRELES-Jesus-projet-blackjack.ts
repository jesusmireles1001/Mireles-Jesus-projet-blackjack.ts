import * as readline from "readline"; // Importa la función para leer la consola

const rl = readline.createInterface({
    input: process.stdin, // Entrada (teclado)
    output: process.stdout, // Salida ( pantalla)
});

type Joueur = { // declaramos todo lo que engloba joueur
    nombre: string;
    manos: string[][];
    puntos: number[];
    apuesta: number[];
    manojugada: number;
};

type Croupier = { // declaramos todo lo que engloba croupier
    nombre: string;
    mano: string[];
    puntos: number;
};

let saldoinicial: number = 76;
let saldoactual: number = 76;
let apuestainicial: number = 8;

const secuenciamax = 100; // total de secuencias a hacer
let contadorsecuencias = 0;
let secuenciasexitosas = 0;
let saldoacumulado = 0;

let tipoapuesta: boolean = false; // apuesta variable o constante seleccion
let nivelapuesta: number = 1;

let joueur: Joueur;
let croupier: Croupier;

function generarcartaaleatoria(): string {
    const cartasPosibles = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A", "K", "Q", "J"]; // todas las cartas aleatorias que tiene la baraja
    const indice = Math.floor(Math.random() * cartasPosibles.length);
    return cartasPosibles[indice];
}

function valorcarta(carta: string): number { // declaracion de valores segun las cartas
    const c = carta.toUpperCase();
    if (c === "A") return 11;
    if (c === "K" || c === "Q" || c === "J") return 10;
    const val = parseInt(c);
    if (val >= 2 && val <= 10) {
        return val;
    }
    return 10;
}

function calcularpuntos(mano: string[]): number { // contar puntos y ases
    let puntos = 0;
    let numAs = 0;
    for (const carta of mano) {
        puntos += valorcarta(carta);
        if (carta.toUpperCase() === "A") numAs++;
    }
    while (puntos > 21 && numAs > 0) { // en caso de tener un as y pasar de 21 se convierte su valor de 11 a 1
        puntos -= 10;
        numAs--;
    }
    return puntos;
}

function agregarcarta(joueur: Joueur, numeromano: number, carta: string) {
    joueur.manos[numeromano].push(carta.toUpperCase());
    joueur.puntos[numeromano] = calcularpuntos(joueur.manos[numeromano]);
}

function mostrarmanojoueur(joueur: Joueur, numeromano: number) {
    const manostr = joueur.manos[numeromano].join(", ");
    const prefijo = joueur.manos.length > 1 ? `(Main ${numeromano + 1}/${joueur.manos.length}) ` : "";
    console.log(
        ` ${prefijo}${joueur.nombre} a: ${manostr} (Points: ${joueur.puntos[numeromano]}) [Mise: ${joueur.apuesta[numeromano]}]`
    );
}

function mostrarmanocroupier(croupier: Croupier, mostrarcarta: boolean) {
    if (mostrarcarta) {
        console.log(
            ` ${croupier.nombre} a: ${croupier.mano.join(", ")} (Points: ${croupier.puntos})`
        );
    } else {
        console.log(` ${croupier.nombre} a: [${croupier.mano[0]}, ?]`);
    }
}

function pedircarta(joueur: Joueur, numeromano: number, callback: () => void) {
    const prefijo = joueur.manos.length > 1 ? `(Main ${numeromano + 1}) ` : "";

    const carta = generarcartaaleatoria(); // Genera carta
    console.log(` Entrez une carte pour ${joueur.nombre} ${prefijo}:  ${carta}`);

    agregarcarta(joueur, numeromano, carta);
    mostrarmanojoueur(joueur, numeromano);
    callback();
}

function pedircartacroupier(carta: string) {
    croupier.mano.push(carta.toUpperCase());
    croupier.puntos = calcularpuntos(croupier.mano);
    console.log(` Croupier prend: ${carta.toUpperCase()}`);
    mostrarmanocroupier(croupier, true);
}

function accionsugerida(): string {
    const manojugador = joueur.manos[joueur.manojugada];
    const puntosjoueur = joueur.puntos[joueur.manojugada];
    const valorcroupier = valorcarta(croupier.mano[0]);
    const carta1 = manojugador[0];
    const carta2 = manojugador[1];

    if (manojugador.length > 2) {
        return strategiat1(puntosjoueur, valorcroupier);
    }
//Tabla pares
    if (carta1 === carta2 && saldoactual >= joueur.apuesta[joueur.manojugada]) {
        const pares = `${carta1}-${carta2}`;
        if (pares === "A-A" || pares === "8-8") {
            return "Partager";
        }
        if (pares === "10-10" || pares === "5-5") {
            return strategiat1(puntosjoueur, valorcroupier);
        }
        switch (pares) {
            case "9-9":
                if (valorcroupier === 7 || valorcroupier >= 10) {
                    return "Rester";
                } else {
                    return "Partager";
                }

            case "7-7":
            case "3-3":
            case "2-2":
                if (valorcroupier >= 2 && valorcroupier <= 7) {
                    return "Partager";
                } else {
                    return "Tirer";
                }

            case "6-6":
                if (valorcroupier >= 2 && valorcroupier <= 6) {
                    return "Partager";
                } else {
                    return "Tirer";
                }

            case "4-4":
                if (valorcroupier === 5 || valorcroupier === 6) {
                    return "Partager";
                } else {
                    return "Tirer";
                }
        }
    }
//Tabla as
    if (carta1 === "A" || carta2 === "A") {
        if (puntosjoueur >= 19) {
            return "Rester";
        }
        if (puntosjoueur === 18) {
            if (puntosjoueur >= 2 && valorcroupier <= 6) {
                return "Doubler";
            }
            else if (valorcroupier === 7 || valorcroupier === 8) {
                return "Rester";
            }
            else {
                return "Tirer";
            }
        }
        if (puntosjoueur === 17) {
            if (valorcroupier >= 3 && valorcroupier <= 6) {
                return "Doubler";
            } else {
                return "Tirer";
            }
        }
        if (puntosjoueur === 16 || puntosjoueur === 15) {
            if (valorcroupier >= 4 && valorcroupier <= 6) {
                return "Doubler";
            } else {
                return "Tirer";
            }
        }
        if (puntosjoueur === 14 || puntosjoueur === 13) {
            if (valorcroupier >= 5 && valorcroupier <= 6) {
                return "Doubler";
            } else {
                return "Tirer";
            }
        }
    }

    return strategiat1(puntosjoueur, valorcroupier);
}
//Tabla Numeros enteros
function strategiat1(puntosjoueur: number, valorcroupier: number): string {
    const puededoblar = saldoactual >= joueur.apuesta[joueur.manojugada];

    if (puntosjoueur > 21) {
        return "Tu as perdu";
    }
    if (puntosjoueur >= 17) {
        return "Rester";
    }
    if (puntosjoueur >= 13 && puntosjoueur <= 16) {
        if (valorcroupier >= 2 && valorcroupier <= 6) {
            return "Rester";
        }
        else {
            return "Tirer";
        }
    }
    if (puntosjoueur === 12) {
        if (valorcroupier >= 4 && valorcroupier <= 6) {
            return "Rester";
        } else {
            return "Tirer";
        }
    }
    if (puntosjoueur === 11 || puntosjoueur === 10) {
        if (valorcroupier >= 2 && valorcroupier <= 9 && puededoblar) {
            return "Doubler";
        } else {
            return "Tirer";
        }
    }
    if (puntosjoueur === 9) {
        if (valorcroupier >= 3 && valorcroupier <= 6 && puededoblar) {
            return "Doubler";
        } else {
            return "Tirer";
        }
    }
    if (puntosjoueur <= 8) {
        return "Tirer";
    }
    return "Rester";
}

function turnojoueur() {
    if (joueur.puntos[joueur.manojugada] > 21) {
        console.log(` Main ${joueur.manojugada + 1} a dépassé 21 .`);
        pasarotramano();
        return;
    }

    const accion = accionsugerida(); // definir las sugerencias como acciones
    console.log(` Action recommandée: ${accion}`);

    switch (accion) {
        case "Tirer":
            pedircarta(joueur, joueur.manojugada, () => turnojoueur());
            break;
        case "Doubler":
            const apuestadoble = joueur.apuesta[joueur.manojugada];
            saldoactual -= apuestadoble;
            joueur.apuesta[joueur.manojugada] += apuestadoble;
            console.log(` Joueur double! Nouvelle mise: ${joueur.apuesta[joueur.manojugada]}. Solde: ${saldoactual}`);
            pedircarta(joueur, joueur.manojugada, () => {
                console.log(" Une seule carte après Doubler. Main terminée.");
                pasarotramano();
            });
            break;
        case "Partager":
            generarsplit();
            break;
        case "Rester":
        case "Bust":
        default:
            console.log(` Joueur s'arrête sur la main ${joueur.manojugada + 1}.`);
            pasarotramano();
            break;
    }
}

function generarsplit() { // crear split a partir de la mano original
    const manoriginal = joueur.manos[joueur.manojugada];
    const apuestaoriginal = joueur.apuesta[joueur.manojugada];
    const carta1 = manoriginal[0];
    const verificaAs = (carta1 === "A");

    const mano1 = [carta1];
    const mano2 = [manoriginal[1]];

    saldoactual -= apuestaoriginal; // pago extra por otra mano
    console.log(` SPLIT Vous payez ${apuestaoriginal} de plus. Solde restant: ${saldoactual}`);

    joueur.manos[joueur.manojugada] = mano1;
    joueur.manos.splice(joueur.manojugada + 1, 0, mano2);
    joueur.apuesta.splice(joueur.manojugada + 1, 0, apuestaoriginal);
    joueur.puntos[joueur.manojugada] = calcularpuntos(mano1);
    joueur.puntos.splice(joueur.manojugada + 1, 0, calcularpuntos(mano2));

    pedircarta(joueur, joueur.manojugada, () => {
        pedircarta(joueur, joueur.manojugada + 1, () => {
            if (verificaAs) {
                console.log("Paire d'As: Une seule carte par main. Terminé.");
                joueur.manojugada += 1;
                pasarotramano();
            } else {
                console.log("\n--- Début du jeu pour la Main 1 (après split) ---");
                mostrarmanojoueur(joueur, joueur.manojugada);
                turnojoueur();
            }
        });
    });
}

function pasarotramano() {
    if (joueur.manojugada < joueur.manos.length - 1) {
        joueur.manojugada++;
        console.log(`\n--- Passage à la main ${joueur.manojugada + 1}/${joueur.manos.length} ---`);
        mostrarmanojoueur(joueur, joueur.manojugada);
        turnojoueur();
    } else {
        console.log("\n--- Toutes les mains du joueur sont jouées ---");
        turnocroupier();
    }
}

function turnocroupier() {
    console.log("\n--- Tour du Croupier ---");
    mostrarmanocroupier(croupier, true);

    let asumperdida = true;
    for (let i = 0; i < joueur.puntos.length; i++) {
        if (joueur.puntos[i] <= 21) {
            asumperdida = false;
            break;
        }
    }

    if (asumperdida) {
        console.log("Toutes les mains du Joueur ont dépassé 21. Le Croupier gagne.");
        evaluarganador();
        return;
    }

    const prendreCarteRecursive = () => {
        if (croupier.puntos < 17) {
            const carte = generarcartaaleatoria();
            console.log(` Croupier a besoin d'une carte : ${carte}`);
            pedircartacroupier(carte);

            if (croupier.puntos > 21) {
                console.log(" Croupier a dépassé 21 ");
                evaluarganador();
            } else {
                prendreCarteRecursive();
            }
        } else {
            console.log(`\n Croupier s'arrête avec ${croupier.puntos} points.`);
            evaluarganador();
        }
    };
    prendreCarteRecursive();
}

function evaluarganador() {
    console.log("\n--- Résultat final ---");
    mostrarmanocroupier(croupier, true);

    let ganancianetatotal = 0;
    let resultadoprincipal: string = "NULLE";

    for (let i = 0; i < joueur.manos.length; i++) {
        const puntosjoueur = joueur.puntos[i];
        const manojoueur = joueur.manos[i];
        const apuesta = joueur.apuesta[i];

        const joueurBJ = (puntosjoueur === 21 && manojoueur.length === 2 && joueur.manos.length === 1);
        const croupierBJ = (croupier.puntos === 21 && croupier.mano.length === 2);

        let ganaestamano = 0;
        let resultadopartida: string;

        console.log(`\n Résultat Main ${i + 1} (Mise: ${apuesta}):`);
        mostrarmanojoueur(joueur, i);

        if (joueurBJ && !croupierBJ) {
            console.log("  -> JOUEUR A BLACKJACK");
            ganaestamano = apuesta * 2.5;
            resultadopartida = "BLACKJACK";
        } else if (croupierBJ && !joueurBJ) {
            console.log("  -> CROUPIER A BLACKJACK (tu as perdu)");
            ganaestamano = 0;
            resultadopartida = "DEFAITE";
        } else if (joueurBJ && croupierBJ) {
            console.log("  -> Égalité (Ambos blackjack)");
            ganaestamano = apuesta;
            resultadopartida = "NULLE";
        } else if (puntosjoueur > 21) {
            console.log("  -> Joueur a dépassé 21 (tu as perdu)");
            ganaestamano = 0;
            resultadopartida = "DEFAITE";
        } else if (croupier.puntos > 21) {
            console.log("  -> Croupier a dépassé 21 (Tu asgagné)");
            ganaestamano = apuesta * 2;
            resultadopartida = "VICTOIRE";
        } else if (puntosjoueur > croupier.puntos) {
            console.log("  -> Le joueur gagne");
            ganaestamano = apuesta * 2;
            resultadopartida = "VICTOIRE";
        } else if (puntosjoueur < croupier.puntos) {
            console.log("  -> Le croupier gagne (Perdu)");
            ganaestamano = 0;
            resultadopartida = "DEFAITE";
        } else {
            console.log("  -> Égalité");
            ganaestamano = apuesta;
            resultadopartida = "NULLE";
        }

        saldoactual += ganaestamano;
        ganancianetatotal += (ganaestamano - apuesta);

        if (i === 0) resultadoprincipal = resultadopartida;
    }

    console.log(`------ Gain/Perte net: ${ganancianetatotal} | Nouveau Solde: ${saldoactual.toFixed(2)}-----`);

    if (tipoapuesta) sistemaapuesta(resultadoprincipal);

    setTimeout(seguirparar, 0); // velocidad de la simulacion
}

function sistemaapuesta(resultado: string) {
    console.log(`--- Système de mise (Niveau: ${nivelapuesta}) ---`);

    if (resultado === "VICTOIRE" || resultado === "BLACKJACK") {
        if (nivelapuesta === 1) {
            nivelapuesta = 2;
            console.log("  Victoire. -> Nv 2 (Mise 2x)");
        } else if (nivelapuesta === 2) {
            nivelapuesta = 3;
            console.log("  Victoire. -> Nv 3 (Mise 3x)");
        } else {
            nivelapuesta = 1;
            console.log("  Victoire (Nv 3). -> Nv 1 (Mise 1x)");
        }
    } else {
        if (nivelapuesta > 1) console.log("  D/N. -> Nv 1 (Mise 1x)");
        nivelapuesta = 1;
    }
}

function seguirparar() {
    if (saldoactual >= saldoinicial * 3) {
        finSecuencia(true);
        return;
    }

    const apuestaactual = tipoapuesta ? (apuestainicial * nivelapuesta) : apuestainicial;
    const msgsistema = tipoapuesta ? `Variable: ${nivelapuesta}x` : "Constant";
    console.log(`\n--- Nouvelle Main (${msgsistema}) ---`);

    if (saldoactual < apuestaactual) {
        console.log(`Solde (${saldoactual}) insuffisant pour la mise (${apuestaactual}).`);
        finSecuencia(false);
        return;
    }
    jouernuevar(apuestaactual);
}

// --- MODIFICADO: Gestión de fin de secuencia y bucle 100 repeticiones ---
function finSecuencia(reussie: boolean) {
    contadorsecuencias++; // Acumular datos de esta secuencia
    if (reussie) secuenciasexitosas++;
    saldoacumulado += saldoactual;

    // Imprimir información de fin de secuencia (
    console.log("--------------------------------------------------------------");
    console.log(`  FIN DE LA SÉQUENCE NUMÉRO: ${contadorsecuencias}`);
    console.log(reussie ? "  RÉSULTAT: RÉUSSIE! (Objectif atteint)" : "  RÉSULTAT: ECHEC ");
    console.log(`  Solde final de cette séquence: ${saldoactual.toFixed(2)}`);
    console.log("----------------------------------------------------------------\n");

    if (contadorsecuencias < secuenciamax) { // Comprobar si debemos seguir simulando o terminar
        lanzarsimulacion(); // Reiniciamos la siguiente secuencia inmediatamente
    } else {

        console.log("---------------------------------------------------------------");

        console.log("               RAPPORTE DE SIMULATION (100 SEQUENCES)");
        console.log(` Séquences jouées  : ${secuenciamax}`);
        console.log(` Séquences réussies: ${secuenciasexitosas}`);
        console.log(` Solde CUMULÉ Final: ${saldoacumulado.toFixed(2)}`);
        console.log("---------------------------------------------------------------");
        rl.close();
    }
}

function jouernuevar(apuestaactual: number) {
    saldoactual -= apuestaactual;
    console.log(`Mise: ${apuestaactual} | Solde restant: ${saldoactual.toFixed(2)}`);

    joueur = { nombre: "Joueur", manos: [[]], puntos: [0], apuesta: [apuestaactual], manojugada: 0 };
    croupier = { nombre: "Croupier", mano: [], puntos: 0 };

    pedircarta(joueur, 0, () => { // Carta 1 Jugador
        pedircarta(joueur, 0, () => { // Carta 2 Jugador

            // Carta 1 Croupier
            const carteC1 = generarcartaaleatoria();
            console.log(`Croupier (Visible):  ${carteC1}`);
            croupier.mano.push(carteC1.toUpperCase());
            croupier.puntos = calcularpuntos(croupier.mano);

            // Carta 2 Croupier (Oculta)
            const carteC2 = generarcartaaleatoria();
            console.log(`Croupier (Cachée): `);
            croupier.mano.push(carteC2.toUpperCase());
            croupier.puntos = calcularpuntos(croupier.mano);

            console.log("\n--- Résultat initial ---");
            mostrarmanojoueur(joueur, 0);
            mostrarmanocroupier(croupier, false);

            const joueurBJ = (joueur.puntos[0] === 21);
            const croupierBJ = (croupier.puntos[0] === 21);

            if (joueurBJ || croupierBJ) {
                evaluarganador();
            } else {
                turnojoueur();
            }
        });
    });
}


function lanzarsimulacion() {// Función para iniciar una nueva secuencia individual (reinicia dinero)
    saldoactual = saldoinicial; // Reinicia a 76 para la nueva secuencia
    nivelapuesta = 1; // Reinicia el nivel de apuesta
    seguirparar();
}

function main() {
    console.clear(); // limpiar la consola
    console.log("  Bienvenue au Simulateur de Blackjack (Mode Auto 100 Séquences)");
    console.log(`  Solde ${saldoinicial} | Mise ${apuestainicial}`);

    rl.question("Système de mise VARIABLE (o/n): ", (reponse) => {
        if (reponse.toLowerCase() === 'o') {
            tipoapuesta = true;
        }
        // Inicia la primera secuencia
        lanzarsimulacion();
    });
}

main();