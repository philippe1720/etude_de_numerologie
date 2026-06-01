import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculerThemeComplet, type ThemeNumerologique } from "../lib/numerologie";
import { logger } from "../lib/logger";

const router = Router();

const SYSTEM_PROMPT = `Tu es un psychanalyste jungien et numérologue humaniste de très haut niveau, spécialisé dans l'intégration de la numérologie humaniste et de la psychologie analytique de Carl Gustav Jung.

Pour chaque analyse, tu DOIS systématiquement aborder :

1. L'OMBRE ET LA LUMIÈRE de chaque nombre : les potentiels lumineux (dons, ressources) ET les aspects d'ombre (défenses, peurs, blocages inconscients).

2. LE PROCESSUS D'INDIVIDUATION : Comment ces nombres guident la personne vers l'intégration de son Soi, selon le chemin d'individuation jungien.

3. LES ARCHÉTYPES ASSOCIÉS : Quels archétypes (l'Héros, l'Ombre, l'Anima/Animus, le Sage, le Trickster, la Grande Mère, etc.) sont activés par ces configurations numériques.

4. LES INTERACTIONS ET CROISEMENTS : Comment l'Élan Spirituel (voyelles) interagit avec le Nombre d'Expression (totalité) — tension ou harmonie ? Comment le Moi Intime (consonnes) filtre-t-il la projection vers le monde ?

5. L'ANNÉE PERSONNELLE (section obligatoire et développée) : Consacre une section entière à l'Année Personnelle en cours. Analyse son chiffre en profondeur : le thème central de cette année, les forces et les défis spécifiques qu'elle amène, les archétypes actifs pendant ce cycle, les opportunités d'intégration psychologique, et les actes concrets à poser pour tirer pleinement profit de ce cycle temporel. Croise l'Année Personnelle avec le Chemin de Vie et l'Élan Spirituel pour en révéler la résonance profonde.

6. LE KARMA ET LES DETTES KARMIQUES : Pour chaque nombre manquant, analyse les peurs inconscientes profondes qu'il génère et propose des actes de résolution concrets et incarnés pour cette vie.

Ton style doit être celui d'un rapport d'analyse profond : précis, nuancé, chaleureux mais exigeant. Utilise un langage riche, évocateur. Chaque section doit avoir une profondeur psychologique réelle — pas de généralités, mais une analyse personnalisée et croisée.

Réponds en français. Structure ton analyse avec des sections claires et des sous-titres. Commence directement par l'analyse, sans introduction générique sur la numérologie.`;

function construirePrompt(theme: ThemeNumerologique): string {
  const { grilleInclusion } = theme;
  const nombresManquants = grilleInclusion.nombresManquants.length > 0
    ? grilleInclusion.nombresManquants.join(", ")
    : "aucun";
  const nombresExces = grilleInclusion.nombresExces.length > 0
    ? grilleInclusion.nombresExces.join(", ")
    : "aucun";

  const apogeesTxt = theme.apogees
    .map((a) => `Apogée ${a.numero}: ${a.valeur}${a.estMaitreNombre ? " (Maître Nombre)" : ""} (${a.ageDebut}–${a.ageFin ?? "∞"} ans)`)
    .join("\n  ");

  const defisTxt = theme.defis
    .map((d) => `${d.type}: ${d.valeur}`)
    .join(", ");

  const frequencesTxt = Object.entries(grilleInclusion.frequences)
    .map(([k, v]) => `${k}×${v}`)
    .join(", ");

  return `Voici le thème numérologique complet de ${theme.prenoms} ${theme.nomNaissance}, né(e) le ${theme.dateNaissance}.

IDENTITÉ NUMÉROLOGIQUE :
- Élan Spirituel (voyelles) : ${theme.elanSpirituel.valeur}${theme.elanSpirituel.estMaitreNombre ? " (Maître Nombre)" : ""}
- Moi Intime (consonnes) : ${theme.moiIntime.valeur}${theme.moiIntime.estMaitreNombre ? " (Maître Nombre)" : ""}
- Nombre d'Expression (totalité) : ${theme.nombreExpression.valeur}${theme.nombreExpression.estMaitreNombre ? " (Maître Nombre)" : ""}
- Chemin de Vie : ${theme.cheminDeVie.valeur}${theme.cheminDeVie.estMaitreNombre ? " (Maître Nombre)" : ""}

CYCLES TEMPORELS :
- Année Personnelle actuelle : ${theme.anneePersonnelle.valeur}${theme.anneePersonnelle.estMaitreNombre ? " (Maître Nombre)" : ""}
- Apogées :
  ${apogeesTxt}
- Défis : ${defisTxt}

KARMA (Grille d'Inclusion) :
- Fréquences : ${frequencesTxt}
- Nombres manquants (dettes karmiques) : ${nombresManquants}
- Nombres en excès : ${nombresExces}

Génère maintenant une analyse complète, profonde et personnalisée selon les directives jungienne-humaniste. Commence directement par l'analyse de l'identité numérologique.`;
}

// POST /api/numerologie/calcul
router.post("/numerologie/calcul", (req, res) => {
  const { prenoms, nomNaissance, dateNaissance } = req.body as {
    prenoms: string;
    nomNaissance: string;
    dateNaissance: string;
  };

  if (!prenoms || !nomNaissance || !dateNaissance) {
    res.status(400).json({ error: "Champs manquants : prenoms, nomNaissance, dateNaissance requis" });
    return;
  }

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(dateNaissance)) {
    res.status(400).json({ error: "Format de date invalide. Utilisez JJ/MM/AAAA" });
    return;
  }

  try {
    const theme = calculerThemeComplet(prenoms.trim(), nomNaissance.trim(), dateNaissance.trim());
    req.log.info({ prenoms, nomNaissance }, "Thème numérologique calculé");
    res.json(theme);
  } catch (err) {
    req.log.error({ err }, "Erreur de calcul numérologique");
    res.status(500).json({ error: "Erreur lors du calcul numérologique" });
  }
});

// POST /api/numerologie/interpretation — SSE streaming
router.post("/numerologie/interpretation", async (req, res) => {
  const { theme } = req.body as { theme: ThemeNumerologique };

  if (!theme) {
    res.status(400).json({ error: "Le thème numérologique est requis" });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    req.log.error("GOOGLE_API_KEY manquant");
    res.status(503).json({ error: "Service IA non configuré" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const MODELS_FALLBACK = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];

  async function tryGenerateStream(modelName: string) {
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });
    const prompt = construirePrompt(theme);
    return model.generateContentStream(prompt);
  }

  // Stop writing if client disconnected
  let clientGone = false;
  req.on("close", () => { clientGone = true; });

  function safeWrite(payload: string): boolean {
    if (clientGone || res.writableEnded) return false;
    try { res.write(payload); } catch { clientGone = true; return false; }
    return true;
  }

  let lastErr: unknown;
  for (const modelName of MODELS_FALLBACK) {
    if (clientGone) break;
    try {
      req.log.info({ modelName }, "Tentative génération IA");
      const result = await tryGenerateStream(modelName);

      let streamOk = true;
      try {
        for await (const chunk of result.stream) {
          if (clientGone) { streamOk = false; break; }
          const text = chunk.text();
          if (text) safeWrite(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      } catch (streamErr: unknown) {
        // Mid-stream parse error — treat as retriable
        lastErr = streamErr;
        req.log.warn({ err: streamErr, modelName }, "Erreur mid-stream, tentative sur le modèle suivant");
        streamOk = false;
      }

      if (streamOk) {
        safeWrite("data: [DONE]\n\n");
        if (!res.writableEnded) res.end();
        req.log.info({ prenoms: theme.prenoms, modelName }, "Interprétation générée avec succès");
        return;
      }
      // Try next model
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number }).status;
      if (status === 503 || status === 429) {
        req.log.warn({ err, modelName }, "Modèle surchargé, tentative sur le suivant");
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      // Unknown error — try next model anyway
      req.log.warn({ err, modelName }, "Erreur inconnue, tentative sur le modèle suivant");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  req.log.error({ err: lastErr }, "Erreur génération IA — tous les modèles échoués");
  safeWrite(`data: ${JSON.stringify({ error: "Erreur lors de la génération de l'interprétation" })}\n\n`);
  if (!res.writableEnded) res.end();
});

export default router;
