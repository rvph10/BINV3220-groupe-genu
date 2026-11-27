User: Analyse le harnais agentique de ce dépôt. Ne modifie aucun fichier.

1. Inventaire. Repère les guides (consignes données à l'agent avant ou pendant son travail) et les senseurs (contrôles qui donnent un retour sur le code produit). Classe-les dans une matrice : guide ou senseur × inférentiel (interprété par une IA) ou computationnel (règles ou calculs exécutables). Pour chaque mécanisme réellement présent : nom et fichier, ce qu'il demande ou vérifie, un exemple concret de règle ou de résultat. Ne remplis pas artificiellement une case vide.

2. Couverture des tests. À partir de EF-32 et EF-33 dans docs/cdc_gesta_developpement.md, découpe les exigences en cas précis avec leur résultat attendu (cas normaux, refus, limites). Pour chaque cas, indique le test existant (fichier et nom), les assertions qui vérifient réellement le résultat attendu, et classe la couverture : Couvert, Partiel ou Absent. Un test qui appelle une route et reçoit une réponse ne suffit pas : les assertions doivent porter sur le résultat attendu.

Signale aussi les tests qui ne correspondent à aucun de ces cas, et les manques les plus importants.

Copilot: Je vais examiner les consignes et contrôles présents dans le dépôt, puis confronter les tests aux exigences détaillées d’EF-32 et EF-33, sans modifier de fichier.

Ran terminal command: git status --short; git ls-files --cached --others --exclude-standard | sort

Search for `EF-32|EF-33`

Search for `EF-32|EF-33|candidature|candidatures`

Ran terminal command: find . -maxdepth 4 \( -name AGENTS.md -o -name CLAUDE.md -o -name '*instructions*' -o -name '*prompt*' -o -name '*skill*' -o -name '.github' -o -name '.husky' -o -name '.vscode' -o -name '.pre-commit-config.yaml' \) -not -path '*/node_modules/*' -print

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/.github/copilot-instructions.md"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/.github/pull_request_template.md"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/package.json"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/package.json"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/package.json"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/README.md"
}

Read , lines 1 to 260
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/tests/applications.test.ts",
  "view_range": [
    1,
    260
  ]
}

Read , line 261 to the end
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/tests/applications.test.ts",
  "view_range": [
    261,
    -1
  ]
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/tests/ApplicationsPage.test.tsx"
}

Read , lines 1 to 260
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/tests/OffersPage.test.tsx",
  "view_range": [
    1,
    260
  ]
}

"Read" failed
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/tests/OffersPage.test.tsx",
  "view_range": [
    261,
    -1
  ]
}
Tool execution failed: view_range out of bounds

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/docs/semaine-2.md"
}

Les exigences métier sont courtes, mais le dépôt documente aussi des choix complémentaires : je les distinguerai des obligations explicites d’EF-32/EF-33 et vérifierai les assertions à chaque couche.

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/tests/App.test.tsx"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/tests/NavBar.test.tsx"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/tests/db/migrations.test.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/tests/db/constraints.test.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/tests/guards.test.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/.oxlintrc.json"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/.oxlintrc.json"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/.vscode/settings.json"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/vitest.config.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/vite.config.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/docs/bilan-1.md"
}

Search for `RG-03|RG-09|candidatur`

Ran terminal command: find .github .vscode -type f -print; git ls-files | grep -E '(^|/)(AGENTS\.md|CLAUDE\.md|SKILL\.md|.*\.instructions\.md|.*\.prompt\.md|.*\.ya?ml|.*\.json)$'

Ran terminal command: node --version; npm --version; test -d node_modules && echo 'node_modules présent' || echo 'node_modules absent'

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/src/db/seed/offersData.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/src/controllers/applications.controller.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/src/repositories/applications.repository.ts"
}

Read , lines 1 to 220
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/API.md",
  "view_range": [
    1,
    220
  ]
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/src/db/migrations/002_applications_non_withdrawn.sql"
}

Read , lines 280 to 380
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/docs/conversation-2.md",
  "view_range": [
    280,
    380
  ]
}

Search for `candidature|applications|offre`

Search for `it\(|it.each|describe\(`

Search for `test|check|review|revue|navigateur|contrôle|vérif|Copilot|Agent|Plan`

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/src/pages/OffersPage.tsx"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/src/components/OfferTable.tsx"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/tests/helpers/testDatabase.ts"
}

Search for `candidatur|application|Candidater|Retirer`

Search for `^##|^###|test|Test|vérif|Vérif`

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/src/services/applications.service.ts"
}

## 1. Inventaire du harnais

Périmètre : mécanismes visibles dans le dépôt. Les conversations et bilans attestent des pratiques passées, pas nécessairement d’une automatisation permanente.

| | Inférentiel | Computationnel |
|---|---|---|
| **Guide** | `Instructions Copilot` : conventions d’architecture, commandes et sécurité ; par exemple, ne jamais modifier une migration déjà appliquée. `Cahier des charges` : exigences métier à interpréter. `Conversation 2` : consignes ponctuelles, notamment implémenter une étape à la fois. `Modèle de PR` : demande notamment des tests d’erreur et une vérification navigateur. | `Paramètres VS Code` : encadrent les actions de l’agent ; par exemple, approbation automatique configurée pour `npm run check`, mais pas pour `git push`. Leur application dépend de l’environnement VS Code effectif. |
| **Senseur** | `Bilan de séance` : relecture humaine du diff et essais navigateur rapportés ; par exemple, correction du format de date. Le même bilan rapporte un parcours navigateur réalisé par une IA. Ces retours sont documentés, pas des contrôles reproductibles automatiquement. | `Pipeline check` : lint, types, tests puis build. `Oxlint backend` et `frontend` : par exemple, `no-explicit-any` est une erreur et les avertissements sont refusés. Les tests Vitest/Supertest/Testing Library vérifient des résultats concrets, détaillés ci-dessous. |

Les contraintes SQLite, notamment `l’index unique partiel`, sont des garde-fous du produit ; leurs **tests** fournissent un retour sur le code. Je n’ai trouvé ni workflow CI versionné ni configuration de revue IA automatique dans les fichiers examinés.

## 2. Couverture d’EF-32 et EF-33

**Méthode.** « Couvert » signifie que les assertions vérifient le résultat indiqué, à la couche testée ; « Partiel » indique une assertion ou une couche manquante. Les tests frontend simulent l’API ; ils ne constituent pas un parcours intégré. Les codes HTTP et règles de doublon sont des choix complémentaires du projet, non des valeurs imposées par `EF-32/EF-33`.

### EF-32 — candidater et retirer

| Cas et résultat attendu | Test et assertions pertinentes | Couverture |
|---|---|---|
| Étudiant, offre publiée, **avec message** : candidature créée pour lui, en cours, message conservé. | `« crée une candidature avec un message et l’identité de la session »` : `201`, DTO, puis étudiant, message et statut en base. `Test UI` : corps POST et message de succès. | **Couvert** |
| Offre publiée, **sans message** : création acceptée sans message. | `« accepte l’absence de message »` : `201` et `message === null`. Le `test UI sans message` vérifie l’envoi sans champ, mais simule un **409**, pas un succès. | **Partiel** : pas d’assertion de persistance du message nul ni de succès UI sans message. |
| Offre non publiée : refus, quel que soit son statut non publié. | `« refuse l’offre non publiée »` : quatre offres correspondant à `SUBMITTED`, `PENDING`, `ASSIGNED`, `ARCHIVED` ; `409` et `OFFER_NOT_PUBLISHED`. `Test UI` : pas de bouton pour une offre attribuée. | **Couvert** pour le refus API ; l’absence d’écriture n’est pas vérifiée. |
| Offre inexistante : refus. | `« refuse une offre inexistante »` : `404`. | **Couvert** pour la réponse ; pas d’assertion sur la base. |
| Session absente ou profil non étudiant : pas de candidature par cette route. | `« refuse les requêtes sans session et les profils non étudiants »` : `401`, puis `403` pour administrateur et contact. `Test UI` : pas de bouton pour l’administrateur. | **Couvert** pour les refus API testés. |
| Candidature personnelle en cours : retrait et statut persistant « Retirée ». | `« retire la candidature en cours et conserve ses données »` : DTO `WITHDRAWN`, statut en base et dans un GET ultérieur. `Test UI` : clic, statut affiché et bouton disparu. | **Couvert** aux deux couches, séparément. |
| Candidature retenue, non retenue ou déjà retirée : retrait refusé, statut inchangé. | `« refuse le retrait d’une candidature %s »` : pour les trois statuts, `409`, code et statut inchangé en base. `Test UI` : aucun bouton sur ces lignes. | **Couvert** |
| Candidature d’un autre étudiant ou inexistante : refus sans divulgation. | `« renvoie la même erreur pour une candidature inexistante ou étrangère »` : trois `404`, corps identiques et candidature étrangère en cours inchangée. | **Couvert** pour ces cas ; le statut étranger retiré n’est pas revérifié en base. |
| Retrait sans session ou par un non-étudiant : refus et candidature inchangée. | `« n’autorise pas une session absente ou un profil non étudiant »` : `401`/`403` et statut toujours `IN_PROGRESS` en base. | **Couvert** |
| Offre archivée après candidature : retrait toujours possible. | `« retire une candidature en cours même si l’offre n’est plus publiée »` : vérifie uniquement `200`. | **Partiel** : ne vérifie pas le nouveau statut ni sa persistance dans ce scénario. |

**Limites et choix complémentaires :**

| Cas et résultat attendu | Test et assertions pertinentes | Couverture |
|---|---|---|
| Corps invalide ou identité étudiante forgée : `400`. | `« refuse un corps invalide ou une identité forgée »` : valeurs manquantes, négatives, fractionnaires, mauvais types et champ `studentId` ; `400 INVALID_BODY`. | **Couvert** pour les entrées énumérées ; absence d’écriture non vérifiée. |
| Identifiant de retrait invalide : `400`. | `« refuse l’identifiant invalide %s »` : zéro, négatif, texte, fraction, notation exponentielle et entier non sûr ; `400 INVALID_PARAMETER`. | **Couvert** pour ces limites. |
| Doublon non retiré : refus ; après retrait : nouvelle candidature et historique conservé. | `« refuse une nouvelle candidature si une candidature %s existe »` : `409 APPLICATION_EXISTS` pour les trois statuts. `« autorise une nouvelle candidature après plusieurs retraits »` : `201` et deux retraits suivis d’une candidature en cours en base. | **Couvert** |
| Deux demandes simultanées : une seule création ou un seul retrait. | `Création` : `201/409` et une ligne ; `retrait` : `200/409`. | **Partiel** : les requêtes sont lancées ensemble, mais le test ne démontre pas une concurrence réelle entre connexions ou processus ; le second ne vérifie pas l’état final en base. |
| Longueur maximale du message. | Aucun test ; `le bilan` précise qu’aucune limite n’est définie. | **Absent**, mais aucun seuil n’est spécifié par EF-32 : il faut d’abord décider de la règle. |

### EF-33 — voir ses candidatures et leurs statuts

| Cas et résultat attendu | Test et assertions pertinentes | Couverture |
|---|---|---|
| Chaque étudiant voit ses propres candidatures, pas celles d’un autre. | `« ne retourne que les candidatures de chaque étudiant »` : corps exact pour Lucas ; identifiants `[2, 5]` et statuts pour Inès. | **Couvert** côté API. |
| Les quatre statuts sont retournés et affichés en français. | `« retourne les quatre statuts… »` : tableau exact des quatre enums. `« affiche les détails et les quatre statuts français »` : assertion sur chaque libellé dans sa ligne. | **Couvert** aux deux couches, séparément. |
| Aucune candidature : liste vide et indication compréhensible. | `Test API` : `200` et `[]`. `« affiche un état vide »` : texte « Aucune candidature à afficher ». | **Couvert** |
| Accès à sa liste : lien et page disponibles à l’étudiant. | `Test navigation` : lien vers `/candidatures`. `Test application` : titre et état vide. | **Couvert** |
| Un autre profil ne consulte pas **cette liste personnelle**. | `Test API` : `401` ou `403 FORBIDDEN`. `Test navigation` : lien absent pour trois profils ; `test application` : page introuvable pour l’administrateur et aucun appel API. | **Couvert** pour les profils testés. Cela ne préjuge pas de la future consultation administrateur prévue par EF-34. |

## Tests complémentaires et manques prioritaires

Des tests ne correspondent pas directement à un cas d’EF-32/EF-33 : `migration avec doublons existants`, `cohérence du seed lié à un stage`, `validation du DTO frontend`, ainsi que les tests d’`erreur serveur ou réponse invalide`. Ils contrôlent respectivement migration, données, contrat et robustesse technique.

**Priorités :**

1. Ajouter un parcours automatisé réel création → consultation → retrait → rechargement : les tests actuels séparent API et interface simulée. Un parcours manuel est rapporté dans le bilan, pas rejoué ici.
2. Vérifier l’**absence de mutation en base** après refus de candidature et le statut persistant après retrait d’une offre archivée.
3. Tester le succès UI et la persistance **sans message**, puis la concurrence avec des connexions réellement distinctes si cette garantie est requise.
4. Le filtre par année/période relève de `RG-09 et EF-72`, pas du seul texte d’EF-33 ; il est signalé comme non implémenté dans le bilan.

Analyse statique : **tests non exécutés**, afin de ne modifier aucun fichier.

User: J'ai vérifié tes deux matrices. Ajoute ou améliore uniquement ces tests backend, dans backend/tests/applications.test.ts, sans modifier le code de l'application :

1. Après chaque refus de candidature (offre inexistante, offre non publiée, doublon, corps invalide), vérifier qu'aucune ligne n'a été ajoutée en base.
2. Retrait alors que l'offre est archivée : vérifier aussi le statut WITHDRAWN dans la réponse et en base.
3. Candidature sans message : vérifier que le message est NULL en base, pas seulement dans la réponse.

Pas de test end-to-end, pas de nouvelle dépendance. Lance ensuite npm run check.

Pour chaque test ajouté ou modifié, explique en une phrase quel défaut du code le ferait échouer.


Copilot: Je vais renforcer uniquement les assertions des tests backend concernés, puis lancer la vérification complète demandée.

Read , lines 1 to 295
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/tests/applications.test.ts",
  "view_range": [
    1,
    295
  ]
}

Ran terminal command: git status --short; node --version

Edit 

Les assertions vérifient désormais les identifiants présents avant et après chaque refus, ainsi que les valeurs persistées demandées. Je lance `npm run check`.

Ran terminal command: npm run check

Ran terminal command: git --no-pager diff --check; git --no-pager diff -- backend/tests/applications.test.ts

Search for `it\("retire une candidature en cours même|it\("accepte l'absence|it\("refuse ...`

Tests modifiés dans `applications.test.ts` :

- `Retrait d’une offre archivée` : échoue si le statut retourné ou enregistré n’est pas `WITHDRAWN`.
- `Absence de message` : échoue si le message enregistré n’est pas `NULL`.
- `Session absente ou profil non étudiant` : échoue si un refus ajoute une candidature.
- `Corps invalide ou identité forgée` : échoue si une candidature est ajoutée malgré le refus.
- `Offre inexistante` : échoue si le refus ajoute une candidature.
- `Offre non publiée` : échoue si le refus ajoute une candidature.
- `Doublon non retiré` : échoue si le refus ajoute une candidature.
- `Doublon avec retrait antérieur` : échoue si le refus ajoute une candidature.

**Validation :** `npm run check` réussi ; 163 tests backend et 77 frontend passent.

User: Audit des guides. Ne modifie aucun fichier.

Voici des consignes du cours Web 2 (slides BINV2150A), avec leur source :
- W1 (S01, Type guard) : valider les données avec des type guards qui vérifient entièrement et uniquement les propriétés. Les exemples du cours utilisent obj: any.
- W2 (S01, Non-null Assertion) : utiliser ! avec prudence.
- W3 (S02, Conventions REST) : verbes et chemins REST (/ressources, /ressources/:id).
- W4 (S02, Codes de retour HTTP) : 400 données invalides, 401 non authentifié, 403 non autorisé, 404 inexistant, 409 conflit ou doublon.
- W5 (S02, Documentation API et Tests d'API) : documenter l'API (Markdown, JSDoc ou OpenAPI) et tester avec des fichiers REST Client.
- W6 (S03) : distinguer authentification et autorisation.
- W7 (S03, Clé secrète) : la clé secrète ne doit jamais être dans le code ni dans Git.
- W8 (S12, Valider les données) : la validation frontend ne remplace pas celle du backend.
- W9 (S17, Stockage web) : ne pas faire confiance au stockage du navigateur (unknown puis type guard) et ne jamais y stocker une information que le serveur doit croire.
- W10 (S19, Séparation des responsabilités, MVVM) : Controller → Service → accès aux données ; frontend en pages/composants (View), hooks (ViewModel), models/services/utils (Model).
- W11 (S19, Organisation des dossiers) : les imports suivent le sens des couches pages → hooks → utils → models, jamais l'inverse.
- W12 (S19, Linter) : oxlint avec rules-of-hooks, exhaustive-deps, set-state-in-effect, only-export-components.

1. Pour chaque consigne, compare-la aux guides réellement fournis à l'agent (.github/copilot-instructions.md, et les documents qu'il cite : README.md, docs/architecture.md, backend/API.md) et à la configuration oxlint. Donne : le guide et le passage exact, la correspondance (Oui / Partielle / Non / Contradiction), et l'ajout ou la précision que tu proposerais. Cite les passages, n'invente rien.

2. Optionnel : propose un senseur d'architecture pour vérifier automatiquement W11 dans le frontend. Précise la règle, quand il s'exécuterait, ce qu'il examinerait, un exemple de violation, et ses limites (faux positifs, coût). Ne l'implémente pas.

Copilot: Je vais comparer chaque consigne aux passages effectivement présents dans les quatre guides et aux règles Oxlint, puis distinguer les omissions des contradictions.

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/.github/copilot-instructions.md"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/README.md"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/docs/architecture.md"
}

Read , lines 1 to 300
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/API.md",
  "view_range": [
    1,
    300
  ]
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/backend/.oxlintrc.json"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/.oxlintrc.json"
}

Search for `type guard|guard|valid|unknown|\bany\b|\bREST\b|GET|POST|PATCH|PUT|DELETE|HTT...`

Ran terminal command: git status --short; git ls-files frontend/src

Search for `^(import|export).*from\s+["']`

Ran terminal command: ./node_modules/.bin/oxlint --help

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/frontend/src/utils/storage.ts"
}

Read 
Completed with input: {
  "path": "/home/rvph/Documents/Vinci/projets/BINV3220-groupe-genu/.gitignore"
}

Ran terminal command: cd frontend && ../node_modules/.bin/oxlint --print-config | grep -E -C 2 'set-state-in-effect|rules-of-hooks|exhaustive-deps|only-export-components'

Ran terminal command: ./node_modules/.bin/oxlint --rules | grep -E 'set-state-in-effect|rules-of-hooks|exhaustive-deps|only-export-components'
Tool execution failed with exit code 1

Search for `secret|jeton|stockage|session|localStorage|authentifi|autorisa|type guards|im...`

## Audit des guides

**Lecture des statuts :** « Oui » signifie que le principe est explicitement transmis ; « Partielle », qu’il manque une précision ou une partie de la consigne. Les citations sont extraites des guides indiqués, pas des slides.

| Consigne | Passage exact et comparaison | Proposition |
|---|---|---|
| **W1 — Type guards** | **Partielle.** `Instructions Copilot` : « Validate request values explicitly […] using type guards » ; elles demandent aussi de valider le JSON frontend. Elles ne précisent pas « entièrement et uniquement les propriétés ». Les configurations `backend` et `frontend` interdisent `any`. | Préciser les propriétés à vérifier et leur portée. Utiliser `unknown` plutôt que `any` : l’exemple du cours n’impose pas nécessairement `any`, donc ce n’est pas une contradiction de principe. Préciser séparément si les champs supplémentaires sont acceptés selon le contrat. |
| **W2 — `!` avec prudence** | **Non.** Aucun passage sur la non-null assertion dans les guides examinés ; les configurations Oxlint ne définissent pas explicitement de règle à son sujet. | Demander de privilégier un contrôle explicite et de n’utiliser `!` que si l’invariant est établi. |
| **W3 — Conventions REST** | **Partielle.** `API` documente `GET /applications`, et `plus loin` `POST /applications` ; elle documente aussi `PATCH /applications/:id/withdraw`. Ce sont des exemples, pas une règle générale de nommage dans les guides. | Énoncer les conventions de verbes et de chemins, et préciser si les chemins d’action comme `/withdraw` sont une exception admise. |
| **W4 — Codes HTTP** | **Oui.** `API` : `400` paramètre ou corps invalide ; `401` session invalide ; `403` « sans droit » ; `404` « introuvable » ; `409` « Conflit de statut ou candidature non retirée existante ». | Rappeler dans les instructions de suivre ce tableau pour toute nouvelle route. |
| **W5 — Documentation et REST Client** | **Partielle.** `Instructions Copilot` : « update `backend/API.md` and relevant `backend/http/*.http` examples ». `API` : « Les requêtes d’exemple se trouvent dans `http/` ». La mise à jour est demandée ; leur **exécution comme test** ne l’est pas explicitement. | Demander d’exécuter les requêtes REST Client pertinentes et de vérifier réponses et erreurs, en complément des tests automatisés. |
| **W6 — Authentification / autorisation** | **Oui.** `Architecture` : « `authenticate` vérifie le jeton » ; « `authorize(règle)` refuse la requête avec un 403 ». | Aucune précision indispensable ; conserver cette distinction pour les nouvelles routes. |
| **W7 — Clé secrète** | **Partielle.** `README` : `setup` crée `backend/.env` « avec une clé de signature aléatoire ». Il ne dit pas explicitement de ne jamais mettre la clé dans le code ou Git. À titre complémentaire, `.gitignore` ignore `.env`, mais ce n’est pas une garantie pour tous les noms de fichiers ni les fichiers déjà suivis. | Ajouter explicitement : secret hors code et hors Git ; utiliser une variable d’environnement ou un mécanisme de gestion des secrets. |
| **W8 — Validation backend** | **Oui.** `Instructions Copilot` : « Validate request values explicitly in controllers » ; elles exigent séparément la validation des réponses côté frontend. | On peut expliciter que les contrôles frontend ne remplacent jamais ceux du serveur. |
| **W9 — Stockage navigateur** | **Partielle.** `Architecture` mentionne le « stockage du jeton » ; les `instructions` indiquent que les rôles sont relus en base. Aucun passage ne généralise la défiance au stockage navigateur ou ne demande `unknown` puis guard pour des données structurées. | Préciser de traiter les données stockées comme non fiables, de valider les objets lus et de ne jamais croire des droits fournis par le navigateur. Un jeton transmis au serveur reste à vérifier côté serveur. |
| **W10 — Responsabilités / MVVM** | **Oui.** `Architecture` : `controllers → services → repositories → SQLite` ; `frontend` : « Le frontend suit le modèle MVVM du cours » et décrit pages, hooks, services et modèles. | Préciser, si souhaité, la correspondance explicite View / ViewModel / Model. |
| **W11 — Sens des imports** | **Partielle.** `Architecture` donne `pages → hooks → services ou utils → models`, mais ne formule pas explicitement « jamais l’inverse » ni les exceptions. | Formuler les dépendances interdites et clarifier les imports qui sautent une couche, les composants et les fichiers d’assemblage. |
| **W12 — Règles Oxlint** | **Oui, avec une précision.** La `configuration frontend` déclare explicitement `rules-of-hooks`, `exhaustive-deps` et `only-export-components`, mais pas `set-state-in-effect`. **La configuration effective** de l’Oxlint installé, inspectée avec `--print-config`, active néanmoins `react/set-state-in-effect` en avertissement ; le `script lint` utilise `--deny-warnings`. | Déclarer explicitement `set-state-in-effect` pour ne pas dépendre d’un défaut implicite susceptible de changer. |

## Senseur d’architecture proposé

- **Règle :** analyser les imports locaux de `frontend/src` et refuser les dépendances vers une couche supérieure : par exemple, `models` ne doit pas importer `utils`, et `utils` ne doit pas importer `hooks` ou `pages`. Inclure les imports de types et les réexports ; autoriser les sauts vers une couche inférieure.
- **Exécution :** contrôle dédié appelé par `npm run check`, après clarification des exceptions pour `App`, `main` et les composants.
- **Violation illustrée :** un fichier de `utils` important un hook depuis `hooks`.
- **Limites :** il faut résoudre correctement chemins relatifs, alias et imports dynamiques ; les cas d’assemblage peuvent produire des faux positifs. Le contrôle porte sur les dépendances, pas sur la qualité réelle de la séparation des responsabilités. Son coût est une analyse statique supplémentaire et la maintenance des règles.

Aucun fichier modifié ; aucun test exécuté pour cet audit.
