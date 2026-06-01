import jsPDF from "jspdf";

interface NombreNumerologique {
  valeur: number;
  estMaitreNombre: boolean;
  valeurBrute?: number | null;
}

interface ThemeNumerologique {
  prenoms: string;
  nomNaissance: string;
  dateNaissance: string;
  elanSpirituel: NombreNumerologique;
  moiIntime: NombreNumerologique;
  nombreExpression: NombreNumerologique;
  cheminDeVie: NombreNumerologique;
  anneePersonnelle: NombreNumerologique;
  apogees: Array<{ numero: number; valeur: number; ageDebut: number; ageFin: number | null; estMaitreNombre: boolean }>;
  defis: Array<{ type: string; valeur: number }>;
  grilleInclusion: {
    frequences: Record<string, number>;
    nombresManquants: number[];
    nombresExces: number[];
  };
}

const INDIGO = [49, 46, 129] as const;
const AMBER = [180, 120, 20] as const;
const DARK = [30, 27, 75] as const;
const GRAY = [120, 113, 108] as const;
const RED_SOFT = [185, 28, 28] as const;

function fmt(n: NombreNumerologique): string {
  const mn = n.estMaitreNombre ? " ★" : "";
  const brut = n.valeurBrute ? ` (${n.valeurBrute})` : "";
  return `${n.valeur}${mn}${brut}`;
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function exportToPdf(theme: ThemeNumerologique, interpretation: string): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const MARGIN = 18;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  function checkPage(needed = 12) {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  }

  function sectionTitle(title: string) {
    checkPage(16);
    y += 6;
    doc.setFillColor(...INDIGO);
    doc.rect(MARGIN, y - 4, CONTENT_W, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), MARGIN + 4, y + 1);
    doc.setTextColor(...DARK);
    y += 10;
  }

  function bigNumber(label: string, data: NombreNumerologique, x: number, bx: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...AMBER);
    doc.text(String(data.valeur), x, bx + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(label, x, bx - 1);

    if (data.estMaitreNombre) {
      doc.setFontSize(6);
      doc.setTextColor(...INDIGO);
      doc.text("MAITRE NOMBRE", x, bx + 13);
    }
    if (data.valeurBrute) {
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(`(${data.valeurBrute})`, x + 10, bx + 8);
    }
  }

  // ── COVER HEADER ──────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("NUMEROLOGIE HUMANISTE", MARGIN, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 195, 240);
  doc.text("Analyse Jungienne Personnalisée", MARGIN, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${theme.prenoms} ${theme.nomNaissance}`, MARGIN, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 175, 220);
  doc.text(`Né(e) le ${theme.dateNaissance}`, MARGIN, 40);

  // Date du rapport
  doc.setTextColor(150, 145, 190);
  doc.setFontSize(8);
  const today = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`Rapport généré le ${today}`, W - MARGIN, 40, { align: "right" });

  y = 52;
  doc.setTextColor(...DARK);

  // ── SECTION 1 : IDENTITÉ ──────────────────────────────────────────────────
  sectionTitle("Les Piliers de l'Identité");

  const colW = CONTENT_W / 4;
  const labels = [
    ["ELAN SPIRITUEL", theme.elanSpirituel],
    ["MOI INTIME", theme.moiIntime],
    ["EXPRESSION", theme.nombreExpression],
    ["CHEMIN DE VIE", theme.cheminDeVie],
  ] as [string, NombreNumerologique][];

  labels.forEach(([label, data], i) => {
    const cx = MARGIN + i * colW;
    doc.setFillColor(248, 246, 255);
    doc.roundedRect(cx, y, colW - 3, 22, 2, 2, "F");
    bigNumber(label, data, cx + 4, y + 7);
  });
  y += 28;

  // ── SECTION 2 : ANNÉE PERSONNELLE ─────────────────────────────────────────
  sectionTitle(`Année Personnelle ${new Date().getFullYear()}`);

  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(...AMBER);
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...AMBER);
  doc.text(String(theme.anneePersonnelle.valeur), MARGIN + 8, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const apLabel = theme.anneePersonnelle.estMaitreNombre ? " — Maître Nombre" : "";
  doc.text(
    `Cycle actuel${apLabel} · Croisement avec le Chemin de Vie ${theme.cheminDeVie.valeur}`,
    MARGIN + 22, y + 8
  );
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(
    "Voir la section « Année Personnelle » dans l'analyse jungienne pour l'interprétation approfondie.",
    MARGIN + 22, y + 14
  );
  y += 24;

  // ── SECTION 3 : CYCLES TEMPORELS ─────────────────────────────────────────
  sectionTitle("Cycles Temporels");

  // Apogées
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("APOGEES", MARGIN, y);
  y += 4;

  theme.apogees.forEach((a, i) => {
    const cx = MARGIN + i * (CONTENT_W / 4);
    doc.setFillColor(248, 246, 255);
    doc.roundedRect(cx, y, CONTENT_W / 4 - 3, 16, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`Apogée ${a.numero}`, cx + 3, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...INDIGO);
    doc.text(String(a.valeur), cx + 3, y + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const ageTxt = a.ageFin ? `${a.ageDebut}–${a.ageFin} ans` : `${a.ageDebut}+ ans`;
    doc.text(ageTxt, cx + 12, y + 13);
  });
  y += 22;

  // Défis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("DEFIS", MARGIN, y);
  y += 4;

  const defiLabels: Record<string, string> = { mineur1: "1er Défi", mineur2: "2e Défi", majeur: "Défi Majeur" };
  theme.defis.forEach((d, i) => {
    const cx = MARGIN + i * (CONTENT_W / 3);
    doc.setFillColor(255, 248, 248);
    doc.roundedRect(cx, y, CONTENT_W / 3 - 3, 14, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(defiLabels[d.type] || d.type, cx + 3, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...RED_SOFT);
    doc.text(String(d.valeur), cx + 3, y + 12);
  });
  y += 20;

  // ── SECTION 4 : GRILLE D'INCLUSION ───────────────────────────────────────
  sectionTitle("Grille d'Inclusion — Karma");

  const cellSize = 14;
  const gridStartX = MARGIN;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const num = row * 3 + col + 1;
      const count = theme.grilleInclusion.frequences[String(num)] || 0;
      const isMissing = count === 0;
      const isExcess = theme.grilleInclusion.nombresExces.includes(num);
      const cx = gridStartX + col * (cellSize + 2);
      const cy = y + row * (cellSize + 2);

      if (isMissing) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(...RED_SOFT);
      } else if (isExcess) {
        doc.setFillColor(238, 242, 255);
        doc.setDrawColor(...INDIGO);
      } else {
        doc.setFillColor(248, 248, 252);
        doc.setDrawColor(220, 215, 230);
      }
      doc.roundedRect(cx, cy, cellSize, cellSize, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(String(num), cx + 2, cy + 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(isMissing ? RED_SOFT[0] : isExcess ? INDIGO[0] : DARK[0],
                       isMissing ? RED_SOFT[1] : isExcess ? INDIGO[1] : DARK[1],
                       isMissing ? RED_SOFT[2] : isExcess ? INDIGO[2] : DARK[2]);
      doc.text(String(count), cx + 4, cy + 11);
    }
  }

  // Legend
  const legendX = MARGIN + 3 * (cellSize + 2) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text("Légende", legendX, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(...RED_SOFT);
  doc.roundedRect(legendX, y + 8, 5, 5, 1, 1, "FD");
  doc.setTextColor(...DARK);
  doc.text("Nombre manquant (dette karmique)", legendX + 7, y + 12);

  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(...INDIGO);
  doc.roundedRect(legendX, y + 16, 5, 5, 1, 1, "FD");
  doc.text("Nombre en excès", legendX + 7, y + 20);

  if (theme.grilleInclusion.nombresManquants.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...RED_SOFT);
    doc.text(`Dettes karmiques : ${theme.grilleInclusion.nombresManquants.join(", ")}`, legendX, y + 30);
  }

  y += 3 * (cellSize + 2) + 10;

  // ── SECTION 5 : ANALYSE JUNGIENNE ────────────────────────────────────────
  if (interpretation && interpretation.trim()) {
    doc.addPage();
    y = 20;

    // Header répété
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("ANALYSE JUNGIENNE PERSONNALISÉE", MARGIN, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 175, 220);
    doc.text(`${theme.prenoms} ${theme.nomNaissance} · ${theme.dateNaissance}`, W - MARGIN, 8, { align: "right" });

    y = 20;
    sectionTitle("Analyse Jungienne Approfondie");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);

    // Process interpretation text — handle markdown-style headers
    const paragraphs = interpretation.split("\n");
    for (const para of paragraphs) {
      if (!para.trim()) {
        y += 3;
        continue;
      }

      checkPage(12);

      const isHeader = para.match(/^#{1,3}\s/);
      const clean = para.replace(/^#{1,3}\s+/, "").replace(/\*\*([^*]+)\*\*/g, "$1");

      if (isHeader) {
        y += 3;
        checkPage(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...INDIGO);
        y = addWrappedText(doc, clean, MARGIN, y, CONTENT_W, 5.5);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        y += 2;
      } else {
        y = addWrappedText(doc, clean, MARGIN, y, CONTENT_W, 5);
        y += 2;
      }
    }
  }

  // ── FOOTER on last page ───────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`Numérologie Humaniste — Analyse Jungienne`, MARGIN, 290);
    doc.text(`Page ${p} / ${pageCount}`, W - MARGIN, 290, { align: "right" });
  }

  const filename = `numerologie_${theme.prenoms.split(" ")[0]}_${theme.nomNaissance}_${theme.dateNaissance.replace(/\//g, "-")}.pdf`;
  doc.save(filename);
}
