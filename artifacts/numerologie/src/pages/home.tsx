import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useCalculerTheme } from "@workspace/api-client-react";
import { setTheme } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  prenoms: z.string().min(1, "Veuillez entrer au moins un prénom"),
  nomNaissance: z.string().min(1, "Veuillez entrer votre nom de naissance"),
  dateNaissance: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Format attendu: JJ/MM/AAAA"),
});

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prenoms: "",
      nomNaissance: "",
      dateNaissance: "",
    },
  });

  const { mutate, isPending } = useCalculerTheme();

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({ data: values }, {
      onSuccess: (data) => {
        setTheme(data);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erreur de calcul",
          description: "Le serveur est temporairement indisponible. Veuillez réessayer dans quelques instants.",
        });
      }
    });
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight">Numérologie Humaniste</h1>
          <p className="text-muted-foreground font-serif italic text-lg md:text-xl">
            Découvrez la carte de votre monde intérieur
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-card-border p-8 rounded-2xl shadow-xl shadow-primary/5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prenoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium tracking-wide uppercase text-muted-foreground">Prénom(s) de naissance</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Carl Gustav" 
                        {...field} 
                        className="bg-background/50 border-input h-12 text-lg font-serif transition-colors focus:bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nomNaissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium tracking-wide uppercase text-muted-foreground">Nom de naissance</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Jung" 
                        {...field} 
                        className="bg-background/50 border-input h-12 text-lg font-serif transition-colors focus:bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateNaissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium tracking-wide uppercase text-muted-foreground">Date de naissance</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="JJ/MM/AAAA"
                        inputMode="numeric"
                        maxLength={10}
                        {...field}
                        onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                        className="bg-background/50 border-input h-12 text-lg font-serif transition-colors focus:bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isPending} 
                  className="w-full h-14 text-lg font-serif tracking-widest uppercase transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Calcul des fondations...
                    </>
                  ) : (
                    "Révéler mon thème"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
