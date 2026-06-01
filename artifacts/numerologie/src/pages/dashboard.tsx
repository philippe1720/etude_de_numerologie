import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { getTheme } from "@/lib/store";
import { StreamingInterpretation } from "@/components/streaming-interpretation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToPdf } from "@/lib/pdf-export";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const theme = getTheme();
  const [interpretationContent, setInterpretationContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!theme) setLocation("/");
  }, [theme, setLocation]);

  const handleInterpretationReady = useCallback((content: string) => {
    setInterpretationContent(content);
  }, []);

  const handleDownloadPdf = async () => {
    if (!theme) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50)); // allow UI to update
      exportToPdf(theme, interpretationContent);
    } finally {
      setIsExporting(false);
    }
  };

  if (!theme) return null;

  const anneeActuelle = new Date().getFullYear();

  return (
    <div className="min-h-[100dvh] w-full bg-background relative selection:bg-primary/20 selection:text-primary">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">

        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground -ml-4"
              onClick={() => setLocation("/")}
              data-testid="button-retour"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="font-serif border-primary/20 text-primary hover:bg-primary/5"
              data-testid="button-download-pdf"
            >
              {isExporting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Télécharger en PDF</>
              )}
            </Button>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight">
              Thème de {theme.prenoms.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground font-serif text-lg mt-2 opacity-80">
              {theme.prenoms} {theme.nomNaissance} · Né(e) le {theme.dateNaissance}
            </p>
          </div>
        </header>

        {/* Section 1: Identité */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-medium border-b border-border pb-2 inline-block">
            Les Piliers de l'Identité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NumberCard title="Élan Spirituel" desc="Voyelles · L'appel de l'âme" data={theme.elanSpirituel} />
            <NumberCard title="Moi Intime" desc="Consonnes · La réalité secrète" data={theme.moiIntime} />
            <NumberCard title="Nombre d'Expression" desc="Totalité · La projection vers le monde" data={theme.nombreExpression} />
            <NumberCard title="Chemin de Vie" desc="Date · La mission incarnée" data={theme.cheminDeVie} />
          </div>
        </section>

        {/* Section Année Personnelle — mise en valeur */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-medium border-b border-border pb-2 inline-block">
            Année Personnelle {anneeActuelle}
          </h2>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10 border border-amber-200/60 dark:border-amber-700/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-8">
              <div className="shrink-0">
                <div
                  className="text-7xl md:text-8xl font-serif text-amber-600 dark:text-amber-400 leading-none"
                  data-testid="text-annee-personnelle"
                >
                  {theme.anneePersonnelle.valeur}
                </div>
                {theme.anneePersonnelle.estMaitreNombre && (
                  <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300">
                    Maître Nombre
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <p className="font-serif text-lg font-medium text-foreground">
                  Un cycle de transformation active
                </p>
                <p className="text-muted-foreground font-serif text-sm leading-relaxed max-w-xl">
                  Votre année personnelle {theme.anneePersonnelle.valeur} résonne avec votre Chemin de Vie{" "}
                  <span className="font-semibold text-foreground">{theme.cheminDeVie.valeur}</span> et votre
                  Élan Spirituel <span className="font-semibold text-foreground">{theme.elanSpirituel.valeur}</span>.
                  L'analyse jungienne approfondie de ce cycle figure dans le rapport ci-dessous.
                </p>
                {theme.anneePersonnelle.valeurBrute && (
                  <p className="text-xs text-muted-foreground font-serif opacity-70">
                    Valeur brute avant réduction : {theme.anneePersonnelle.valeurBrute}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Section Cycles Temporels */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-medium border-b border-border pb-2 inline-block">
              Apogées et Défis
            </h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-lg text-muted-foreground uppercase tracking-widest text-sm">Les 4 Apogées</h3>
                <div className="grid grid-cols-2 gap-3">
                  {theme.apogees.map((apogee) => (
                    <Card key={apogee.numero} className="bg-card/50 p-4" data-testid={`card-apogee-${apogee.numero}`}>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        Apogée {apogee.numero}
                        {apogee.estMaitreNombre && (
                          <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary/20 text-[9px]">★</Badge>
                        )}
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-serif text-primary">{apogee.valeur}</div>
                        <div className="text-xs text-muted-foreground">
                          {apogee.ageFin ? `${apogee.ageDebut}–${apogee.ageFin} ans` : `${apogee.ageDebut}+ ans`}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-lg text-muted-foreground uppercase tracking-widest text-sm">Les Défis</h3>
                <div className="grid grid-cols-3 gap-3">
                  {theme.defis.map((defi) => (
                    <Card key={defi.type} className="bg-card/50 p-4 text-center" data-testid={`card-defi-${defi.type}`}>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {defi.type === 'mineur1' ? '1er' : defi.type === 'mineur2' ? '2ème' : 'Majeur'}
                      </div>
                      <div className="text-3xl font-serif text-rose-500 dark:text-rose-400">{defi.valeur}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section Grille d'Inclusion */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-medium border-b border-border pb-2 inline-block">
              Grille d'Inclusion (Karma)
            </h2>
            <Card className="bg-card/50 p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 md:gap-5 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const count = theme.grilleInclusion.frequences[num.toString()] || 0;
                  const isMissing = count === 0;
                  const isExcess = theme.grilleInclusion.nombresExces.includes(num);
                  return (
                    <div
                      key={num}
                      data-testid={`cell-grille-${num}`}
                      className={[
                        "aspect-square flex flex-col items-center justify-center rounded-xl border relative transition-all",
                        isMissing
                          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                          : isExcess
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                          : "bg-background border-border",
                      ].join(" ")}
                    >
                      <span className="text-sm absolute top-2 left-2 text-muted-foreground font-serif">{num}</span>
                      <span className={`text-3xl font-serif ${isMissing ? "text-rose-400" : "text-foreground"}`}>
                        {count}
                      </span>
                      {isMissing && (
                        <div className="absolute bottom-1 text-[9px] uppercase tracking-widest text-rose-500 font-medium">
                          Karmique
                        </div>
                      )}
                      {isExcess && (
                        <div className="absolute bottom-1 text-[9px] uppercase tracking-widest text-indigo-500 font-medium">
                          Excès
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {theme.grilleInclusion.nombresManquants.length > 0 && (
                <p className="text-center text-sm text-muted-foreground font-serif mt-6 italic">
                  Dettes karmiques : {theme.grilleInclusion.nombresManquants.join(", ")}
                </p>
              )}
            </Card>
          </section>
        </div>

        {/* Section Interprétation IA */}
        <section className="pt-8 border-t border-border space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-serif font-medium">Analyse Jungienne Approfondie</h2>
            {interpretationContent && (
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                size="sm"
                className="font-serif border-primary/20 text-primary hover:bg-primary/5"
                data-testid="button-download-pdf-bottom"
              >
                {isExporting ? (
                  <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Génération...</>
                ) : (
                  <><Download className="w-3 h-3 mr-2" />Télécharger le rapport PDF</>
                )}
              </Button>
            )}
          </div>
          <StreamingInterpretation theme={theme} onContentReady={handleInterpretationReady} />
        </section>

      </div>
    </div>
  );
}

function NumberCard({
  title,
  desc,
  data,
}: {
  title: string;
  desc: string;
  data: { valeur: number; estMaitreNombre: boolean; valeurBrute?: number | null };
}) {
  return (
    <Card className="bg-card/50 relative overflow-hidden group hover:bg-card transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-sans tracking-widest text-muted-foreground uppercase flex justify-between items-start">
          <span>{title}</span>
          {data.estMaitreNombre && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
              Maître
            </Badge>
          )}
        </CardTitle>
        <div className="text-xs text-muted-foreground font-serif italic opacity-70">{desc}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-serif text-foreground group-hover:text-primary transition-colors">
            {data.valeur}
          </span>
          {data.valeurBrute && data.valeurBrute !== data.valeur && (
            <span className="text-lg text-muted-foreground font-serif opacity-60">({data.valeurBrute})</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
