// Moteur de calcul numérologique - Réduction théosophique avec Maîtres Nombres

const VOYELLES = new Set(["A", "E", "I", "O", "U", "Y"]);

const VALEURS_LETTRES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

export interface NombreNumerologique {
  valeur: number;
  estMaitreNombre: boolean;
  valeurBrute: number | null;
}

export interface GrilleInclusion {
  frequences: Record<string, number>;
  nombresManquants: number[];
  nombresExces: number[];
}

export interface Apogee {
  numero: number;
  valeur: number;
  ageDebut: number;
  ageFin: number | null;
  estMaitreNombre: boolean;
}

export interface Defi {
  type: "mineur1" | "mineur2" | "majeur";
  valeur: number;
}

export interface ThemeNumerologique {
  prenoms: string;
  nomNaissance: string;
  dateNaissance: string;
  elanSpirituel: NombreNumerologique;
  moiIntime: NombreNumerologique;
  nombreExpression: NombreNumerologique;
  cheminDeVie: NombreNumerologique;
  anneePersonnelle: NombreNumerologique;
  apogees: Apogee[];
  defis: Defi[];
  grilleInclusion: GrilleInclusion;
}

function normaliserTexte(texte: string): string {
  return texte
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^A-Z]/g, ""); // garde uniquement les lettres
}

function sommeDigits(n: number): number {
  return String(n)
    .split("")
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

function estMaitreNombre(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}

function reductionTheosophique(n: number): NombreNumerologique {
  if (n <= 9 || estMaitreNombre(n)) {
    return { valeur: n, estMaitreNombre: estMaitreNombre(n), valeurBrute: null };
  }
  const brute = n;
  let courant = n;
  while (courant > 9 && !estMaitreNombre(courant)) {
    courant = sommeDigits(courant);
    if (courant <= 9 || estMaitreNombre(courant)) break;
  }
  return {
    valeur: courant,
    estMaitreNombre: estMaitreNombre(courant),
    valeurBrute: brute !== courant ? brute : null,
  };
}

function valeurLettre(lettre: string): number {
  return VALEURS_LETTRES[lettre] ?? 0;
}

function calculerElanSpirituel(nomComplet: string): NombreNumerologique {
  const lettres = normaliserTexte(nomComplet);
  const somme = [...lettres]
    .filter((l) => VOYELLES.has(l))
    .reduce((acc, l) => acc + valeurLettre(l), 0);
  return reductionTheosophique(somme);
}

function calculerMoiIntime(nomComplet: string): NombreNumerologique {
  const lettres = normaliserTexte(nomComplet);
  const somme = [...lettres]
    .filter((l) => !VOYELLES.has(l))
    .reduce((acc, l) => acc + valeurLettre(l), 0);
  return reductionTheosophique(somme);
}

function calculerNombreExpression(nomComplet: string): NombreNumerologique {
  const lettres = normaliserTexte(nomComplet);
  const somme = [...lettres].reduce((acc, l) => acc + valeurLettre(l), 0);
  return reductionTheosophique(somme);
}

function calculerCheminDeVie(dateNaissance: string): NombreNumerologique {
  const [jour, mois, annee] = dateNaissance.split("/").map(Number);
  const sommeJour = reductionTheosophique(jour).valeur;
  const sommeMois = reductionTheosophique(mois).valeur;
  const sommeAnnee = reductionTheosophique(
    String(annee)
      .split("")
      .reduce((acc, d) => acc + parseInt(d, 10), 0)
  ).valeur;
  const total = sommeJour + sommeMois + sommeAnnee;
  return reductionTheosophique(total);
}

function calculerAnneePersonnelle(
  jour: number,
  mois: number,
  anneeUniverselle: number
): NombreNumerologique {
  const sommeAnnee = reductionTheosophique(
    String(anneeUniverselle)
      .split("")
      .reduce((acc, d) => acc + parseInt(d, 10), 0)
  ).valeur;
  const total = reductionTheosophique(jour).valeur + reductionTheosophique(mois).valeur + sommeAnnee;
  return reductionTheosophique(total);
}

function calculerApogees(
  jour: number,
  mois: number,
  annee: number,
  cheminDeVie: number
): Apogee[] {
  const sommeJour = reductionTheosophique(jour).valeur;
  const sommeMois = reductionTheosophique(mois).valeur;
  const sommeAnnee = reductionTheosophique(
    String(annee).split("").reduce((acc, d) => acc + parseInt(d, 10), 0)
  ).valeur;

  const apogee1Brut = sommeJour + sommeMois;
  const apogee2Brut = sommeJour + sommeAnnee;
  const apogee3Brut = reductionTheosophique(apogee1Brut).valeur + reductionTheosophique(apogee2Brut).valeur;
  const apogee4Brut = sommeMois + sommeAnnee;

  const duree1 = 36 - cheminDeVie;

  const apogees: Apogee[] = [
    {
      numero: 1,
      valeur: reductionTheosophique(apogee1Brut).valeur,
      ageDebut: 0,
      ageFin: duree1,
      estMaitreNombre: estMaitreNombre(reductionTheosophique(apogee1Brut).valeur),
    },
    {
      numero: 2,
      valeur: reductionTheosophique(apogee2Brut).valeur,
      ageDebut: duree1 + 1,
      ageFin: duree1 + 9,
      estMaitreNombre: estMaitreNombre(reductionTheosophique(apogee2Brut).valeur),
    },
    {
      numero: 3,
      valeur: reductionTheosophique(apogee3Brut).valeur,
      ageDebut: duree1 + 10,
      ageFin: duree1 + 18,
      estMaitreNombre: estMaitreNombre(reductionTheosophique(apogee3Brut).valeur),
    },
    {
      numero: 4,
      valeur: reductionTheosophique(apogee4Brut).valeur,
      ageDebut: duree1 + 19,
      ageFin: null,
      estMaitreNombre: estMaitreNombre(reductionTheosophique(apogee4Brut).valeur),
    },
  ];

  return apogees;
}

function calculerDefis(jour: number, mois: number, annee: number): Defi[] {
  const sommeJour = reductionTheosophique(jour).valeur;
  const sommeMois = reductionTheosophique(mois).valeur;
  const sommeAnnee = reductionTheosophique(
    String(annee).split("").reduce((acc, d) => acc + parseInt(d, 10), 0)
  ).valeur;

  const defi1 = Math.abs(sommeJour - sommeMois);
  const defi2 = Math.abs(sommeJour - sommeAnnee);
  const defiMajeur = Math.abs(defi1 - defi2);

  return [
    { type: "mineur1", valeur: defi1 },
    { type: "mineur2", valeur: defi2 },
    { type: "majeur", valeur: defiMajeur },
  ];
}

function calculerGrilleInclusion(nomComplet: string): GrilleInclusion {
  const lettres = normaliserTexte(nomComplet);
  const frequences: Record<string, number> = {};

  for (let i = 1; i <= 9; i++) {
    frequences[String(i)] = 0;
  }

  for (const lettre of lettres) {
    const val = valeurLettre(lettre);
    if (val >= 1 && val <= 9) {
      frequences[String(val)]++;
    }
  }

  const total = Object.values(frequences).reduce((a, b) => a + b, 0);
  const moyenne = total / 9;

  const nombresManquants: number[] = [];
  const nombresExces: number[] = [];

  for (let i = 1; i <= 9; i++) {
    if (frequences[String(i)] === 0) {
      nombresManquants.push(i);
    } else if (frequences[String(i)] > Math.ceil(moyenne) + 1) {
      nombresExces.push(i);
    }
  }

  return { frequences, nombresManquants, nombresExces };
}

export function calculerThemeComplet(
  prenoms: string,
  nomNaissance: string,
  dateNaissance: string
): ThemeNumerologique {
  const nomComplet = `${prenoms} ${nomNaissance}`;
  const [jour, mois, annee] = dateNaissance.split("/").map(Number);
  const anneeActuelle = new Date().getFullYear();

  const cheminDeVie = calculerCheminDeVie(dateNaissance);
  const apogees = calculerApogees(jour, mois, annee, cheminDeVie.valeur);

  return {
    prenoms,
    nomNaissance,
    dateNaissance,
    elanSpirituel: calculerElanSpirituel(nomComplet),
    moiIntime: calculerMoiIntime(nomComplet),
    nombreExpression: calculerNombreExpression(nomComplet),
    cheminDeVie,
    anneePersonnelle: calculerAnneePersonnelle(jour, mois, anneeActuelle),
    apogees,
    defis: calculerDefis(jour, mois, annee),
    grilleInclusion: calculerGrilleInclusion(nomComplet),
  };
}
