# Bilan — semaine 9 : skills, TDD et hooks

Conversations : `docs/conversation-4.md` (recherche en TDD) et `docs/conversation-4-hook.md` (essais du hook).

## Audit des tests (Test Gap Audit)

Non réalisé : le dossier `test-gap-audit` n'est pas disponible sur MooVin (ni dans la section Phase 5, ni ailleurs dans le cours). Je ne l'ai vu que dans les slides « Skills et hooks » (`.github/skills/test-gap-audit/` avec `SKILL.md` et `scripts/coverage_map.py`). Je n'ai pas voulu le réécrire à partir des slides.

Un audit de même nature avait été fait en semaine 8 sur les mêmes tests (EF-32, EF-33), sans skill : voir la matrice de couverture de `docs/semaine-3.md`, les tests renforcés et les défauts introduits volontairement pour vérifier qu'ils échouent.

## TDD

Installation :
- skill `test-driven-development` de Superpowers (`obra/superpowers`, licence MIT conservée dans `LICENSE`) copié dans `.github/skills/test-driven-development/`, avec `writing-good-tests.md` ;
- consigne du cours ajoutée au début du skill (préparer et exécuter les tests, puis attendre une validation explicite) ;
- paragraphe ajouté à `.github/copilot-instructions.md` pour appliquer le skill à toute nouvelle fonctionnalité ;
- vérifié que le skill n'a pas `disable-model-invocation: true`.

Déclenchement automatique : ma demande ne mentionnait ni le skill ni les tests. La première action de Copilot est `Read skill test-driven-development`, puis il lit `writing-good-tests.md`. Il a écrit les tests, les a exécutés, puis s'est arrêté pour demander : « Validez-vous ces tests avant l'implémentation ? ». Il n'a modifié le code de l'application qu'après ma réponse.

Test vu en échec puis en réussite. Avant l'implémentation, Copilot annonçait 11 tests API en échec « car l'API ignore `q` » et les 2 tests d'interface en échec « car le champ de recherche n'existe pas encore ». J'ai validé les tests directement, sans les relire en détail sur le moment. Je l'ai vérifié ensuite en retirant temporairement l'implémentation (git stash) :
- backend : `cherche l'expression littérale "  pOrTaIl cLiEnT  " uniquement dans le titre` échoue avec `expected [ 8, 2, 4, 7, 5, 1, 3, 6, 10, 9 ] to deeply equal [ 2 ]` : l'API renvoie toutes les offres au lieu de la seule qui correspond. L'échec vient donc bien de la recherche manquante, pas d'une erreur de syntaxe ou d'installation ;
- frontend : `Unable to find an accessible element with the role "searchbox" and name /rechercher.*titre/i` : le champ n'existe pas ;
- avec l'implémentation, tous ces tests passent.

Avis sur les tests proposés : ils suivent bien les règles données (casse, espaces, recherche vide, expression entière, combinaison avec la période, visibilité étudiant et déposant). Ils testent aussi qu'un `%` est cherché tel quel et qu'un paramètre `q` répété est refusé, ce qui n'était pas dans les règles mais reprend la convention de la recherche d'entreprises. Point faible : la validation a été rapide ; j'aurais dû relire les tests avant de répondre, c'est justement le rôle de la pause.

## Recherche

Implémentation : paramètre `q` sur `GET /offers` (même convention que `GET /companies`), validé dans le contrôleur ; filtrage dans le service, après les règles de visibilité et la période ; champ « Rechercher par titre » sur la page des offres, avec un message « Aucune offre ne correspond à la recherche. ».

Cas essayés dans le navigateur (par un assistant IA, Claude, à ma demande, avec un enregistrement de la séquence) :
- administratrice, `  APPLICATION  ` : 2 offres (« Application React de gestion de flotte », « Migration d'une application vers le cloud ») — casse et espaces ignorés ;
- même recherche avec la période P1 : aucune offre, message adapté ;
- `xyz introuvable` : aucune offre, message adapté ;
- recherche effacée : les 10 offres reviennent ;
- étudiant (Lucas Dupont), `portail` : aucune offre (« Refonte du portail client » n'est pas publiée) ;
- étudiant, `application` : 1 seule offre, la publiée.

`npm run check` : lint, typecheck, 177 tests backend, 79 frontend et build passent.

Problèmes restants :
- le filtrage se fait en mémoire dans le service, pas en SQL comme la période : toutes les offres visibles sont chargées puis filtrées. Sans conséquence avec 10 offres, mais pas adapté à un grand volume ;
- pas de longueur maximale pour `q`, alors que la recherche d'entreprises la limite à 100 caractères ;
- Copilot a ajouté un délai de 300 ms avant d'envoyer la recherche pendant la frappe, qui n'était pas demandé ;
- le bloc de tests de la recherche est imbriqué dans le `describe` du filtre par période.

## Hook

Hook `tool-guardian` du cours installé dans `.github/hooks/` (`tool-guardian.json`, `guard-tool.cjs`), avec `demo-protected.txt` à la racine. Événement : `preToolUse`, commande `node .github/hooks/guard-tool.cjs`, réponse `permissionDecision: "deny"` quand une suppression de `demo-protected.txt` est détectée.

Essais dans Copilot (nouvelle session, `docs/conversation-4-hook.md`) :
1. « Exécute git status » : la commande s'exécute normalement, le hook ne prend aucune décision.
2. « Supprime demo-protected.txt avec une commande du terminal » : Copilot appelle bien l'outil (`rm demo-protected.txt`), et l'appel est refusé avant son exécution : `Denied by preToolUse hook: Démonstration Tool Guardian : suppression de demo-protected.txt interdite.` Le fichier existe toujours.

C'est la preuve que le hook s'est déclenché : Copilot n'a pas refusé de lui-même, il a tenté la commande et c'est le hook qui l'a bloquée. Le script a aussi été vérifié avec les événements simulés du mode d'emploi (`deny` pour `rm demo-protected.txt`, `{}` pour `git status`).

Limite : la détection est textuelle ; elle ne protège pas contre une suppression via un autre langage, des variables shell ou des jokers.

## Crédits IA

Environ 12 crédits (de 1 401 à 1 413 sur 1 500).
