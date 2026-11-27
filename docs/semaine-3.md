# Bilan — semaine 8 : harnais agentique (guides et senseurs)

## Inventaire

Copilot a proposé une première matrice. Je l'ai vérifiée en ouvrant les fichiers et j'en ai corrigé deux cases : il classait la relecture humaine décrite dans les bilans comme « senseur inférentiel », alors qu'inférentiel signifie interprété par une IA ; et il oubliait les documents que `copilot-instructions.md` cite lui-même comme références.

| | Inférentiel (interprété par une IA) | Computationnel (règles exécutables) |
|---|---|---|
| **Guide** (feedforward) | `.github/copilot-instructions.md` (généré par `/init`, relu en séance 6) : commandes, architecture, conventions. Ex. : « never edit an already-applied migration ». Il renvoie à `docs/architecture.md`, `backend/API.md` et `docs/cdc_gesta_developpement.md`, que l'agent lit aussi. Le template de PR (`.github/pull_request_template.md`) liste les vérifications attendues. | Pas de vrai guide computationnel (pas de générateur de code ni de modèle de fichier). `.vscode/settings.json` (réglages du cours) n'oriente pas le code produit : ce sont des permissions qui limitent ce que l'agent peut exécuter sans approbation (ex. `npm run check` autorisé, `git push` soumis à approbation). Je le classe comme garde-fou plutôt que comme guide. |
| **Senseur** (feedback) | Aucun : pas de revue de code par une IA configurée dans le dépôt. | `npm run check` : Oxlint (`no-explicit-any` en erreur, avertissements refusés), TypeScript, tests Vitest/Supertest/Testing Library, build. Les contraintes SQLite (CHECK, clés étrangères, index unique partiel de la migration 002) renvoient aussi une erreur à l'exécution. |

Exécuté pendant la séance : `npm run check` et les tests des candidatures. Seulement configuré ou décrit : le reste. Il n'y a ni CI ni hook Git : rien n'oblige à lancer `npm run check`, il faut que l'humain ou l'agent y pense.

## Couverture des exigences

Matrice produite par Copilot, puis vérifiée en ouvrant chaque test cité. Un cas est « Couvert » seulement si une assertion porte sur le résultat attendu.

| Exigence | Cas à vérifier | Test (`backend/tests/applications.test.ts` sauf mention) | Couverture avant | Après |
|---|---|---|---|---|
| EF-32 | Candidature avec message : créée, en cours, pour l'étudiant de la session | « crée une candidature avec un message et l'identité de la session » | Couvert | Couvert |
| EF-32 | Candidature sans message | « accepte l'absence de message » : vérifiait seulement la réponse | Partiel | Couvert (message `NULL` en base) |
| EF-32 / RG-03 | Offre non publiée : refus, rien d'enregistré | « refuse l'offre non publiée » : vérifiait seulement 409 | Partiel | Couvert (aucune ligne ajoutée) |
| EF-32 | Offre inexistante : refus, rien d'enregistré | « refuse une offre inexistante » | Partiel | Couvert |
| EF-32 | Profil non étudiant ou sans session : refus | « refuse les requêtes sans session et les profils non étudiants » | Partiel | Couvert |
| EF-32 | Doublon non retiré : refus, rien d'enregistré | « refuse une nouvelle candidature si une candidature %s existe » | Partiel | Couvert |
| EF-32 | Retrait d'une candidature en cours, persistant | « retire la candidature en cours et conserve ses données » | Couvert | Couvert |
| EF-32 | Retrait alors que l'offre est archivée | « retire une candidature en cours même si l'offre n'est plus publiée » : vérifiait seulement 200 | Partiel | Couvert (statut `WITHDRAWN` en réponse et en base) |
| EF-32 | Retrait d'une candidature déjà traitée : refus, statut inchangé | « refuse le retrait d'une candidature %s » | Couvert | Couvert |
| EF-32 | Retrait de la candidature d'un autre étudiant : refus sans divulgation | « renvoie la même erreur pour une candidature inexistante ou étrangère » | Couvert | Couvert |
| EF-32 | Deux requêtes simultanées | « n'accepte qu'une candidature… » / « n'effectue qu'un retrait… » | Partiel | Partiel (voir limites) |
| EF-32 | Longueur maximale du message | — | Absent | Absent : aucune règle n'est définie, il faut d'abord la décider |
| EF-33 | Un étudiant ne voit que ses candidatures | « ne retourne que les candidatures de chaque étudiant » (Lucas et Inès) | Couvert | Couvert |
| EF-33 | Les quatre statuts, affichés en français | « retourne les quatre statuts… » + `ApplicationsPage.test.tsx` | Couvert | Couvert |
| EF-33 | Liste vide | test API + « affiche un état vide » | Couvert | Couvert |
| EF-33 | Autre profil : pas d'accès | test API (401/403) + `NavBar.test.tsx`, `App.test.tsx` | Couvert | Couvert |

Tests qui ne correspondent pas à EF-32/EF-33 : migration sur une base contenant des doublons, cohérence du seed, validation des réponses côté frontend (guards), erreurs serveur. Ils vérifient la migration, les données et le contrat, pas une exigence métier.

## Modifications et vérification

Tests renforcés dans `backend/tests/applications.test.ts`, sans toucher au code de l'application :
- après chaque refus de candidature (sans session, autre profil, corps invalide, offre inexistante, offre non publiée, doublon), vérifier qu'aucune ligne n'a été ajoutée ;
- retrait sur une offre archivée : statut `WITHDRAWN` dans la réponse et en base ;
- candidature sans message : `NULL` en base.

`npm run check` : lint, typecheck, 163 tests backend, 77 frontend et build passent.

Pour vérifier que ces tests détectent vraiment un défaut, j'ai introduit temporairement trois erreurs dans le code, puis restauré le code (git) :

| Défaut introduit | Résultat |
|---|---|
| Enregistrer `""` au lieu de `NULL` sans message | « accepte l'absence de message » échoue |
| Insérer la candidature puis répondre « offre non publiée » | les 4 tests « refuse l'offre non publiée » échouent |
| Le retrait ne change pas le statut | 3 tests de retrait échouent |

Le deuxième défaut, rejoué avec les anciens tests, passait inaperçu (45 tests verts) : une candidature était créée malgré le refus. Le premier aurait déjà été détecté par l'ancien test, qui vérifiait la réponse.

Limites :
- **Concurrence** : `better-sqlite3` est synchrone et l'application tourne dans un seul processus. Les deux requêtes « simultanées » des tests s'exécutent donc l'une après l'autre : ces tests passeraient même sans transaction. C'est l'index unique partiel en base qui garantit l'unicité ; il est vérifié par un test direct sur la base.
- Pas de test de bout en bout : l'API et l'interface sont testées séparément (l'interface avec une API simulée). Le parcours complet a été vérifié à la main en semaine 7.

## Audit des guides

Références Web 2 : slides du cours BINV2150A (https://e-vinci.github.io/BINV2150A-slides/), lues dans leur source (dépôt `e-vinci/BINV2150A-slides`). Copilot a repéré les passages des guides ; j'ai vérifié chaque citation dans les fichiers.

| Attente Web 2 (source) | Guide examiné (fichier et passage) | Correspondance | Écart ou ajout proposé |
|---|---|---|---|
| W1 — Type guards qui vérifient entièrement les propriétés (S01, *Type guard*) | `copilot-instructions.md` : « Validate request values explicitly in controllers using type guards » ; Oxlint : `no-explicit-any` en erreur | Partielle | Les exemples du cours utilisent `obj: any`, que le lint du projet interdit : le projet utilise `unknown`. Ce n'est pas une contradiction de principe, mais l'agent qui suivrait l'exemple du cours serait bloqué par le lint. Préciser « `unknown`, puis vérifier toutes les propriétés ». |
| W2 — `!` avec prudence (S01, *Non-null Assertion*) | Aucun passage | Non | Ajouter une consigne. À noter : le code actuel ne contient aucune non-null assertion. |
| W3 — Conventions REST (S02) | `backend/API.md` : routes documentées une à une | Partielle | Exemples, pas de règle. `PATCH /applications/:id/withdraw` est une route d'action : préciser si c'est admis. |
| W4 — Codes HTTP (S02, *Codes de retour HTTP*) | `backend/API.md`, tableau des erreurs : 400, 401, 403, 404, 409 | Oui | Demander de suivre ce tableau pour toute nouvelle route. |
| W5 — Documenter l'API, tester avec REST Client (S02) | `copilot-instructions.md` : « update `backend/API.md` and relevant `backend/http/*.http` examples » | Partielle | La mise à jour est demandée, pas l'exécution des requêtes. |
| W6 — Authentification ≠ autorisation (S03) | `docs/architecture.md` : « `authenticate` vérifie le jeton » ; « `authorize(règle)` refuse la requête avec un 403 » | Oui | — |
| W7 — Clé secrète hors code et hors Git (S03, *Clé secrète*) | `README.md` : `setup` crée `backend/.env` « avec une clé de signature aléatoire » ; `.gitignore` contient `.env` | Partielle | Respecté en pratique, mais jamais formulé comme règle pour l'agent. |
| W8 — La validation front ne remplace pas le backend (S12) | `copilot-instructions.md` : validation dans les controllers et « Keep authorization on the backend » | Oui | — |
| W9 — Ne pas faire confiance au stockage navigateur (S17) | `docs/architecture.md` : « stockage du jeton » ; `copilot-instructions.md` : rôles relus en base | Partielle | Généraliser : toute donnée lue dans le stockage est `unknown` et validée. |
| W10 — Séparation des responsabilités, MVVM (S19) | `docs/architecture.md` : « controllers → services → repositories → SQLite » ; « Le frontend suit le modèle MVVM du cours » | Oui | — Écart observé dans le code (semaine 7) : des règles métier dans le repository des candidatures, que les guides n'auraient pas permis d'éviter. |
| W11 — Imports dans le sens des couches (S19, *Organisation des dossiers*) | `docs/architecture.md` : « pages → hooks → services ou utils → models » | Partielle | Le sens est donné, pas l'interdiction (« jamais l'inverse »). |
| W12 — Règles oxlint (S19, *Linter*) | `frontend/.oxlintrc.json` : `rules-of-hooks`, `exhaustive-deps`, `only-export-components` | Oui, avec une précision | `set-state-in-effect` n'est pas déclaré ; il est actif par défaut dans la version installée (`oxlint --print-config` : `"react/set-state-in-effect": "warn"`, et le lint refuse les avertissements). Le déclarer explicitement. |

Conclusion : les guides couvrent bien l'architecture, l'authentification et les codes HTTP. Ils manquent surtout de règles formulées comme des interdictions (W2, W7, W11) et ne disent rien du stockage navigateur en général. Les guides n'ont pas été modifiés : l'énoncé demande un audit.

## Optionnel — senseur d'architecture

- **Règle** : dans `frontend/src`, un fichier ne peut importer que depuis sa couche ou une couche inférieure (`pages → hooks → services/utils → models`, W11). Ex. : `models` n'importe jamais `utils`, `utils` n'importe jamais `hooks` ni `pages`.
- **Quand** : un script appelé par `npm run check`, donc à chaque vérification locale (et en CI s'il y en avait une).
- **Données** : les imports locaux de chaque fichier, y compris les imports de types.
- **Exemple de violation** : un fichier de `utils/` qui importe un hook depuis `hooks/`.
- **Limites** : chemins relatifs et imports dynamiques à résoudre ; exceptions à définir pour `App.tsx`, `main.tsx` et les composants ; il vérifie les dépendances, pas la qualité de la séparation des responsabilités (il n'aurait pas détecté les règles métier placées dans un repository).

Non implémenté.

## Crédits IA

Environ 17 crédits (de 1 384 à 1 401 sur 1 500).
