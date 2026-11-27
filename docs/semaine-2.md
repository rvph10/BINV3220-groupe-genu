# Bilan — semaine 7 : les candidatures (EF-32, EF-33)

## Choix

Le plan a été préparé avec le mode Plan de Copilot, puis implémenté en mode Agent, une étape à la fois. Copilot a signalé les points que le cahier des charges ne tranche pas et m'a posé la question ; j'ai retenu :

- **Doublons** : un étudiant ne peut avoir qu'une seule candidature non retirée par offre. S'il existe une candidature En cours, Retenue ou Non retenue, une nouvelle candidature est refusée (409). J'ai précisé ce point après lecture du plan : la première version (« une seule candidature *en cours* ») aurait permis de recandidater après un refus.
- **Recandidature après retrait** : autorisée, en créant une nouvelle candidature. L'ancienne reste « Retirée » pour garder l'historique.
- **Liste des candidatures** : toutes les années, avec l'année et la période affichées. RG-09 prévoit des listes filtrées par année et période : ce filtre n'est pas fait (voir limites).
- **Retrait de la candidature d'un autre étudiant** : 404, la même réponse qu'une candidature inexistante, pour ne pas révéler qu'elle existe.
- **Pas de confirmation avant le retrait** : l'étudiant peut recandidater ensuite.
- **Une migration** (`002_applications_non_withdrawn.sql`) ajoute un index unique partiel sur (étudiant, offre) pour les candidatures non retirées. La règle est ainsi garantie par la base, même si deux requêtes arrivent en même temps.

## Résultat

Les trois étapes fonctionnent : candidater (avec ou sans message), consulter ses candidatures avec les quatre statuts, retirer une candidature en cours.

Le mode Plan a été utile surtout pour faire apparaître les décisions métier avant d'écrire du code : c'est en relisant le plan que j'ai repéré le problème de la recandidature après un refus. Découper en trois étapes validées une par une m'a permis de relire des diffs de taille raisonnable et de demander des corrections entre deux étapes.

Limites restantes :
- la liste des candidatures n'est pas filtrée par année et période (RG-09) ;
- le bouton « Candidater » reste affiché sur une offre à laquelle l'étudiant a déjà candidaté ; il reçoit alors un message d'erreur ;
- le message de candidature n'a pas de longueur maximale ;
- les règles « offre publiée » et « pas de doublon » sont vérifiées dans le repository, dans une transaction, alors que les conventions du projet placent les règles métier dans les services. C'est un compromis pour que la vérification et l'écriture soient atomiques.

## Modifications

- **Base** : `002_applications_non_withdrawn.sql` (index unique partiel).
- **Backend** : `applications.controller.ts` (`POST /applications`, `GET /applications`, `PATCH /applications/:id/withdraw`, validation du corps et de l'identifiant), `applications.service.ts` (rôle étudiant, traduction des résultats en erreurs HTTP), `applications.repository.ts` (requêtes SQL et transactions), `application.ts` et `application.mapper.ts` (DBO → objet métier → DTO), branchement dans `app.ts`.
- **Frontend** : bouton et formulaire de candidature dans `OfferTable.tsx` et `OffersPage.tsx`, page `ApplicationsPage.tsx` avec `useApplications.ts`, lien « Mes candidatures » dans `NavBar.tsx` et route dans `App.tsx`, service, guards, libellés des statuts dans `labels.ts`, formatage des dates dans `date.ts`.
- **Documentation** : `API.md`, `backend/http/applications.http`, `README.md`.

Corrections demandées après relecture de l'étape 2 :
- la date s'affichait au format brut de SQLite, en UTC. Elle est maintenant convertie en heure locale (`27/11/2026 14:45`), en interprétant bien la valeur comme de l'UTC ;
- `POST /applications` renvoyait l'objet métier sans DTO, avec `studentId`. Il passe maintenant par un DTO, comme les autres routes.

## Validation fonctionnelle

- Étapes 1 et 2 : testées par moi dans le navigateur. Candidature avec et sans message, deuxième candidature à la même offre refusée, pas de colonne « Candidature » pour l'administratrice ; liste des candidatures de Lucas Dupont et des autres étudiants.
- Étape 3 et parcours complet : testés dans le navigateur par un assistant IA (Claude), à ma demande, avec un enregistrement de la séquence. Je prévois de refaire ces essais moi-même :
  - administratrice : pas de lien « Mes candidatures » ;
  - Lucas Dupont : retrait d'une candidature en cours → « Retirée », toujours « Retirée » après rechargement ; nouvelle candidature à la même offre → deux lignes, l'ancienne « Retirée » et la nouvelle « En cours » ; dates au format local ;
  - Léa Mertens (« Non retenue ») et Mateusz Kowalski (« Retenue ») : pas de bouton « Retirer ».
- Non vérifié dans l'interface (impossible par l'interface, couvert par les tests d'API) : candidature à une offre non publiée, retrait de la candidature d'un autre étudiant, accès d'un autre profil à `GET /applications`.

## Qualité

- Diff relu après chaque étape, en particulier la migration : l'index porte bien sur `status <> 'WITHDRAWN'`, ce qui correspond à la règle choisie.
- Le retrait est une seule requête `UPDATE … WHERE id = ? AND student_id = ? AND status = 'IN_PROGRESS'` : la propriété, le statut et la modification sont vérifiés en même temps.
- L'identité de l'étudiant vient toujours de la session, jamais du corps de la requête.
- Écarts repérés et corrigés : format de la date, absence de DTO pour la création. Écart repéré et laissé : règles métier dans le repository (voir limites).
- Copilot a aussi mis à jour `README.md` sans que ce soit demandé ; c'est cohérent avec les nouvelles fonctionnalités, je l'ai gardé.

## Tests et commandes

- `npm run check` après chaque étape : lint, typecheck, build et tests passent. Au final, 163 tests backend et 77 frontend (contre 116 et 49 au début de la séance).
- Tests ajoutés côté backend (`applications.test.ts`, `migrations.test.ts`) : candidature avec et sans message, profils non étudiants (403), offre inexistante (404) ou non publiée (409), doublon pour chaque statut non retiré (409), nouvelle candidature après retrait, deux candidatures simultanées (une seule acceptée), isolation entre deux étudiants, quatre statuts et tri, retrait réussi et persistant, retrait d'une candidature étrangère ou inexistante (404), identifiant invalide (400), retrait d'une candidature déjà traitée (409), deux retraits simultanés, application de la migration sur une base existante.
- Tests ajoutés côté frontend : formulaire de candidature et erreurs, page « Mes candidatures » (statuts, liste vide, bouton « Retirer »), lien de navigation selon le profil, formatage des dates (hiver, été, autre fuseau, valeurs invalides), guards.
- Exemple : le test « renvoie la même erreur pour une candidature inexistante ou étrangère » essaie de retirer un identifiant qui n'existe pas (99999), puis deux candidatures d'Inès Haddad (une en cours, une retirée). Il vérifie que les trois réponses sont des 404 avec exactement le même corps, et que la candidature d'Inès est toujours « En cours » en base après la tentative.

## Crédits IA

Environ 44 crédits (de 1 340 à 1 384 sur 1 500).
