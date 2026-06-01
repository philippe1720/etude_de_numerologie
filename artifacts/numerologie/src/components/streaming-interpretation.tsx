import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ThemeNumerologique } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

interface Props {
  theme: ThemeNumerologique;
  onContentReady?: (content: string) => void;
}

export function StreamingInterpretation({ theme, onContentReady }: Props) {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setHasStarted(true);
    setError("");
    setContent("");
    onContentReady?.("");

    try {
      const response = await fetch('/api/numerologie/interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) throw new Error("Failed to start stream");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') { done = true; break; }
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  accumulated += data.content;
                  setContent(accumulated);
                } else if (data.error) {
                  setError(data.error);
                  done = true;
                  break;
                }
              } catch {
                // Ignore partial chunk parse errors
              }
            }
          }
        }
      }
      onContentReady?.(accumulated);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la génération. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasStarted && !isGenerating && !content) {
    return (
      <div
        data-testid="interpretation-cta"
        className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-card/50"
      >
        <h3 className="font-serif text-2xl mb-4 text-primary">Le Miroir de l'Âme</h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          Plongez dans les profondeurs de votre psyché. L'intelligence artificielle, guidée par la
          psychologie analytique de Carl Jung, va tisser les liens entre vos nombres et vos
          archétypes intérieurs.
        </p>
        <Button
          data-testid="button-generate"
          onClick={handleGenerate}
          size="lg"
          className="font-serif text-lg tracking-wide px-8 h-14"
        >
          Générer mon analyse profonde
        </Button>
      </div>
    );
  }

  return (
    <div className="prose prose-amber dark:prose-invert max-w-none">
      <div className="bg-card border rounded-xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div
          data-testid="interpretation-content"
          className="relative z-10 whitespace-pre-wrap font-serif leading-relaxed text-lg text-foreground/90"
        >
          {content}
        </div>

        {isGenerating && (
          <div className="mt-8 flex items-center justify-center space-x-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-serif italic tracking-wider">L'oracle déchiffre les symboles...</span>
          </div>
        )}

        {!isGenerating && content && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              className="text-muted-foreground text-xs"
              data-testid="button-regenerate"
            >
              Régénérer l'analyse
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
