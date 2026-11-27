# Bilan — semaine 10 : MCP et tests end-to-end avec Playwright

Conversations : `docs/conversation-5-mcp.md` (scénario 1 avec Playwright MCP) et `docs/conversation-5-playwright.md` (génération des tests Playwright Test).

## Scénarios

Scénarios décrits dans [e2e/recherche-offres/scenarios.md](../e2e/recherche-offres/scenarios.md), avant de lancer Copilot :

1. **Recherche avec résultat** : l'étudiant Lucas Dupont cherche `  APPLICATION  ` → « 1 offre », uniquement « Application React de gestion de flotte » (publiée).
2. **Recherche sans résultat visible** : il cherche `portail` → « Aucune offre ne correspond à la recherche. », puis efface la recherche → les 4 offres publiées reviennent.

Choix : le scénario 1 vérifie en un seul parcours trois règles de la semaine 9 (casse, espaces, visibilité étudiant), car « Migration d'une application vers le cloud » contient aussi le mot mais n'est pas publiée. Le scénario 2 est le cas limite : une offre « Refonte du portail client » existe, mais n'est pas publiée ; le résultat doit être vide et le message adapté, et la liste doit revenir quand on efface. Les deux scénarios utilisent les données de démonstration et ne modifient rien.

## MCP

Serveur Playwright MCP lancé dans un terminal (`npx -y @playwright/mcp@latest --isolated --port 8931`), connecté à Copilot par `.mcp.json` à la racine (HTTP sur localhost). Scénario exécuté : **scénario 1**, résultat conforme (1 offre, la bonne, statut « Publiée » ; l'offre de migration absente).

Appels d'outils observés :
- `Click` sur l'élément « Lucas Dupont, étudiant » (référence `e33`), suivi d'un `Page snapshot` : l'outil renvoie à l'agent l'arbre de la page avec des références d'éléments, que Copilot utilise ensuite pour cliquer sur le lien « Offres » (`e124`) ;
- `Type text` avec le texte `"  APPLICATION  "` dans « Rechercher par titre » (`e141`), suivi d'un `Page snapshot` : c'est à partir de ce snapshot que Copilot constate « 1 offre » et la ligne « Application React de gestion de flotte ».

Limite : l'export de la conversation montre les appels et leurs paramètres, pas le contenu des snapshots renvoyés ; le résultat repose donc sur le compte rendu de Copilot, cohérent avec mes essais de la semaine 9.

Observation : Copilot a pris l'initiative de lancer sa propre instance de l'application avec une base temporaire, sans que ce soit demandé. Il a signalé ne pas pouvoir confirmer que le navigateur utilisait cette instance. Mon `npm run dev` occupait déjà les ports 3000 et 5173 : son instance n'a pas pu démarrer et c'est mon application (base réinitialisée juste avant avec `npm run db:reset`) qui a été testée.

## Playwright Test

Installation : `npm init playwright@latest` (TypeScript, dossier `e2e`). Fichiers :
- `playwright.config.ts` : `testDir: './e2e'`, `baseURL: 'http://localhost:5173'`, `webServer` qui lance `e2e/recherche-offres/start-server.mjs` ;
- `e2e/recherche-offres/start-server.mjs` (créé par Copilot) : démarre l'application avec une base SQLite temporaire neuve, sur un port d'API libre, et la supprime à la fin. Les tests ne dépendent donc ni de ma base locale ni de l'ordre d'exécution. Il contient une clé `JWT_SECRET` écrite en dur : c'est une clé de test sans valeur, utilisée seulement pour l'instance temporaire, mais c'est un écart à la consigne de Web 2 (« jamais de clé dans le code ») à signaler ;
- `e2e/recherche-offres/recherche-offres.spec.ts` : un test par scénario, numéro dans le nom.

Principales assertions :
- avant chaque test : connexion de Lucas Dupont, page « Offres de stage », « 4 offres » ;
- scénario 1 : « 1 offre », 2 lignes dans le tableau (en-tête + 1), la ligne « Application React de gestion de flotte » avec la cellule « Publiée », et « Migration d'une application vers le cloud » absente ;
- scénario 2 : message « Aucune offre ne correspond à la recherche. », aucun tableau, « Refonte du portail client » absente ; après effacement, « 4 offres » et les 4 titres publiés.

Sélecteurs : rôles et noms accessibles (`getByRole('searchbox', { name: 'Rechercher par titre' })`, `getByRole('row')`…), pas de classes CSS.

Corrections que j'ai faites après relecture :
- retrait du projet WebKit : il ne démarre pas sur ma machine (bibliothèques système `libicu74` et `libjpeg-turbo8` absentes), diagnostic correct de Copilot ; restent Chromium et Firefox ;
- suppression de `e2e/example.spec.ts` (exemple de `npm init playwright` qui teste le site playwright.dev, pas notre application) ;
- rapport `list` au lieu de `html`.

Deux exécutions successives de `npx playwright test` (mon `npm run dev` arrêté, car le serveur de test utilise le port 5173) : **4 passed** puis **4 passed** (2 scénarios × Chromium et Firefox).

`npm run check` : lint, typecheck, 177 tests backend, 79 frontend et build passent. Il ne lance pas les tests E2E : ils restent à lancer explicitement avec `npx playwright test`.

Remarque : Copilot a appliqué le skill TDD (consigne de `copilot-instructions.md`) et m'a demandé de valider les tests, alors qu'il s'agissait de tests de non-régression d'une fonctionnalité existante.

## Vérification

Défaut temporaire : dans `backend/src/services/offers.service.ts`, la condition de recherche remplacée par `true` (la recherche ne filtre plus rien). Résultat avec `npx playwright test --project=chromium` :
- scénario 1 échoue sur `expect(page.getByText('1 offre', { exact: true })).toBeVisible()` : la page affiche toujours toutes les offres ;
- scénario 2 échoue sur `expect(page.getByText('Aucune offre ne correspond à la recherche.')).toBeVisible()`.

Les deux échecs viennent du défaut, pas d'une erreur de configuration ou de connexion : la connexion et la page « 4 offres » du `beforeEach` réussissent. Après restauration du code (`git checkout`), les 2 tests repassent. Le défaut n'est pas dans la PR. Cette vérification a été faite par un assistant IA (Claude), à ma demande.

## Comparaison

1. **Ce que permet Playwright MCP** : donner à l'agent des outils pour piloter un vrai navigateur pendant la conversation (naviguer, cliquer, saisir, lire la page). J'ai vu passer `Type text` avec `"  APPLICATION  "` dans le champ de recherche, puis un `Page snapshot` dont Copilot a tiré le résultat « 1 offre ».
2. **Ce qu'apportent les scripts Playwright Test** : ils sont versionnés, se relancent à l'identique sans agent ni crédits, donnent un résultat binaire (passé / échoué) avec l'assertion exacte qui a échoué, et peuvent être mis en CI. Le compte rendu MCP dépend de l'interprétation du modèle et n'est pas rejouable : je n'ai même pas le contenu des snapshots dans l'export.
3. **Quand préférer l'un ou l'autre** : MCP pour explorer une page inconnue, reproduire un bug signalé ou vérifier rapidement une modification d'interface pendant le développement. Un test automatisé pour tout comportement qu'on veut garantir dans la durée (non-régression), et dès qu'il faut une preuve reproductible.

## Crédits IA

Environ 13 crédits (de 1 413 à 1 426 sur 1 500).
