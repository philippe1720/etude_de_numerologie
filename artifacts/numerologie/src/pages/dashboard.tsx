import { useEffect } from "react";
import { useLocation } from "wouter";
import { getTheme } from "@/lib/store";
import { StreamingInterpretation } from "@/components/streaming-interpretation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const theme = getTheme();

  useEffect(() => {
    if (!theme) {
      setLocation("/");
    }
  }, [theme, setLocation]);

  if (!theme) return null;

  return (
    <div className="min-h-[100dvh] w-full bg-background relative selection:bg-primary/20 selection:text-primary">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
        
        {/* Header */}
        <header className="space-y-4">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground -ml-4"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight">
              Thème de {theme.prenoms.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground font-serif text-lg mt-2 opacity-80">
              Né(e) le {theme.dateNaissance}
            </p>
          </div>
        </header>

        {/* Section 1: Identité */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-medium border-b border-border pb-2 inline-block">Les Piliers de l'Identité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NumberCard title="Élan Spirituel" desc="(Voyelles)" data={theme.elanSpirituel} />
            <NumberCard title="Moi Intime" desc="(Consonnes)" data={theme.moiIntime} />
            <NumberCard title="Nombre d'Expression" desc="(Totalité)" data={theme.nombreExpression} />
            <NumberCard title="Chemin de Vie" desc="(Date)" data={theme.cheminDeVie} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Section 2: Cycles Temporels */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-medium border-b border-border pb-2 inline-block">Cycles Temporels</h2>
            
            <div className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-sans tracking-widest text-muted-foreground uppercase">Année Personnelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-serif text-primary">
                    {theme.anneePersonnelle.valeur}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="font-serif text-xl">Les 4 Apogées</h3>
                <div className="grid grid-cols-2 gap-3">
                  {theme.apogees.map((apogee) => (
                    <Card key={apogee.numero} className="bg-card/50 p-4">
                      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Apogée {apogee.numero}</div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-serif">{apogee.valeur}</div>
                        <div className="text-sm text-muted-foreground">
                          {apogee.ageFin ? `${apogee.ageDebut} - ${apogee.ageFin} ans` : `${apogee.ageDebut}+ ans`}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-xl">Les Défis</h3>
                <div className="grid grid-cols-3 gap-3">
                  {theme.defis.map((defi) => (
                    <Card key={defi.type} className="bg-card/50 p-4 text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {defi.type.replace('mineur1', '1er').replace('mineur2', '2ème').replace('majeur', 'Majeur')}
                      </div>
                      <div className="text-3xl font-serif text-accent">{defi.valeur}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Grille d'Inclusion */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-medium border-b border-border pb-2 inline-block">Grille d'Inclusion (Karma)</h2>
            <Card className="bg-card/50 p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-sm mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const count = theme.grilleInclusion.frequences[num.toString()] || 0;
                  const isMissing = count === 0;
                  const isExcess = theme.grilleInclusion.nombresExces.includes(num);

                  return (
                    <div 
                      key={num} 
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-xl border relative
                        transition-all duration-500
                        ${isMissing ? 'bg-destructive/5 border-destructive/20' : 
                          isExcess ? 'bg-primary/10 border-primary/30' : 
                          'bg-background border-border'}
                      `}
                    >
                      <span className="text-sm absolute top-2 left-2 text-muted-foreground font-serif">{num}</span>
                      <span className={`text-3xl font-serif ${isMissing ? 'text-destructive/50' : 'text-foreground'}`}>
                        {count}
                      </span>
                      {isMissing && <div className="absolute bottom-1 text-[10px] uppercase tracking-widest text-destructive">Karmique</div>}
                      {isExcess && <div className="absolute bottom-1 text-[10px] uppercase tracking-widest text-primary">Excès</div>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        </div>

        {/* Section 4: Interpretation IA */}
        <section className="pt-8 border-t border-border">
          <StreamingInterpretation theme={theme} />
        </section>

      </div>
    </div>
  );
}

function NumberCard({ title, desc, data }: { title: string, desc: string, data: any }) {
  return (
    <Card className="bg-card/50 relative overflow-hidden group hover:bg-card transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-sans tracking-widest text-muted-foreground uppercase flex justify-between items-start">
          <span>{title}</span>
          {data.estMaitreNombre && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">Maître</Badge>
          )}
        </CardTitle>
        <div className="text-xs text-muted-foreground font-serif italic">{desc}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-serif text-foreground group-hover:text-primary transition-colors">
            {data.valeur}
          </span>
          {data.valeurBrute && data.valeurBrute !== data.valeur && (
            <span className="text-lg text-muted-foreground font-serif opacity-60">
              ({data.valeurBrute})
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
