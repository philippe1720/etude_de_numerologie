# Numérologie Humaniste

Application web de numérologie humaniste jungienne : calcule un thème numérologique complet à partir de l'état civil et génère une interprétation psychologique profonde via l'API Google Gemini.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/numerologie run dev` — run the frontend (port auto)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `GOOGLE_API_KEY` — Google Gemini API key for AI interpretation

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5
- AI: Google Gemini 1.5 Pro (streaming SSE)
- Validation: Zod, react-hook-form
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `artifacts/api-server/src/lib/numerologie.ts` — moteur de calcul numérologique (réduction théosophique, maîtres nombres)
- `artifacts/api-server/src/routes/numerologie.ts` — routes POST /calcul et /interpretation (Gemini streaming)
- `artifacts/numerologie/src/pages/home.tsx` — formulaire d'entrée
- `artifacts/numerologie/src/pages/dashboard.tsx` — affichage du thème complet
- `artifacts/numerologie/src/components/streaming-interpretation.tsx` — composant SSE streaming
- `artifacts/numerologie/src/lib/store.ts` — état session du thème

## Architecture decisions

- Calcul numérologique 100% côté serveur (TypeScript strict, réduction théosophique avec conservation des maîtres nombres 11, 22, 33)
- Interprétation IA via SSE streaming depuis le backend (la clé API Gemini ne transite jamais côté client)
- Thème passé via sessionStorage entre les pages (pas de base de données nécessaire)
- System prompt jungien hardcodé côté serveur pour garantir la cohérence des analyses

## Product

- Formulaire de saisie de l'état civil (prénoms, nom de naissance, date de naissance)
- Dashboard affichant les 4 piliers (Élan Spirituel, Moi Intime, Expression, Chemin de Vie)
- Grille d'Inclusion 3×3 avec mise en évidence des dettes karmiques (nombres manquants) et des excès
- Cycles temporels : Année Personnelle, 4 Apogées, 3 Défis
- Interprétation jungienne en streaming générée par Gemini 1.5 Pro

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Le modèle Gemini utilisé est `gemini-1.5-pro` (direct API, pas via Replit AI Integrations)
- L'interprétation SSE lit les chunks `data: {...}` et s'arrête sur `data: [DONE]`
- Toujours relancer `pnpm --filter @workspace/api-spec run codegen` après modification du spec OpenAPI

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
