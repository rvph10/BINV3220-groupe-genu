# Bilan global du projet

## Ce que j'ai appris

**Relire le plan avant le code.** Le moment le plus utile n'a pas été l'implémentation mais la relecture du plan en semaine 7 : la première règle proposée (« une seule candidature en cours ») laissait un étudiant recandidater après un refus. Une phrase à corriger dans un plan coûte beaucoup moins qu'une fonctionnalité à refaire. J'ai aussi appris à trancher moi-même les décisions que le cahier des charges ne règle pas, et à les écrire.

**Découper et valider étape par étape.** Demander une seule étape à la fois, avec un périmètre précis (« ne touche à rien d'autre »), donne des diffs que je peux réellement lire. Quand je relisais, je trouvais des choses : une indentation parasite, un fichier `mcp.json` créé pendant `/init` sans être signalé, une date affichée en UTC, une réponse d'API sans DTO.

**Un test qui passe ne prouve pas grand-chose.** En semaine 8, plusieurs tests vérifiaient seulement le code HTTP. En introduisant volontairement un défaut (une candidature enregistrée malgré un refus), les 45 tests restaient verts. J'ai compris la différence entre un test qui appelle une route et un test dont les assertions portent sur le résultat attendu, et l'intérêt de « casser » le code pour vérifier qu'un test échoue. Même chose pour les tests de requêtes simultanées : avec SQLite synchrone, ils ne prouvaient pas l'atomicité ; c'est l'index unique en base qui la garantit.

**Le harnais.** Je sais maintenant distinguer un guide (ce qu'on dit à l'agent avant : `copilot-instructions.md`, l'architecture, un skill) d'un senseur (ce qui lui renvoie un résultat : lint, types, tests), et inférentiel de computationnel. L'audit par rapport à Web 2 m'a montré que les guides décrivent bien l'architecture mais formulent peu d'interdictions, et qu'une règle peut être active « par défaut » sans être écrite (`set-state-in-effect`).

**Skills et hooks.** Un skill est chargé quand la tâche le demande : Copilot a lu le skill TDD de lui-même alors que ma demande n'en parlait pas, et s'est arrêté pour faire valider les tests. Un hook, lui, ne dépend pas de la bonne volonté du modèle : le refus de supprimer `demo-protected.txt` vient du script, pas de Copilot.

**Vérifier les affirmations de l'agent.** Copilot se trompe peu sur le code, mais il classe parfois mal (une relecture humaine rangée comme « senseur inférentiel ») ou affirme sans prouver. Ouvrir les fichiers cités et relancer les commandes soi-même est indispensable. J'ai aussi utilisé un deuxième assistant IA pour relire les diffs, lancer les vérifications et faire certains essais dans le navigateur ; je l'ai indiqué dans les bilans concernés.

**Les crédits.** Une demande d'explication coûte peu avec un modèle inclus ; une implémentation complète coûte beaucoup plus. Regrouper les demandes et choisir le modèle selon la tâche compte vraiment.

## Ce que je n'ai pas appris et que j'aurais aimé apprendre

- **Suivre le projet au rythme des séances.** J'ai réalisé une grande partie du projet en peu de temps, en fin de quadrimestre. Je n'ai donc pas pu discuter mes choix en séance ni comparer avec d'autres groupes.
- **Écrire mes propres skills.** J'ai installé et adapté des skills existants, mais je n'en ai pas conçu un de zéro. Le skill `test-gap-audit` n'était pas disponible : j'aurais aimé l'utiliser et le comparer à l'audit fait à la main en semaine 8.
- **Tests end-to-end et MCP en pratique.** Je comprends le principe de MCP (un client, un serveur qui expose des outils), mais je n'ai pas encore piloté un navigateur avec Playwright MCP ni écrit de tests Playwright versionnés.
- **Mettre un senseur en CI.** Rien n'oblige à lancer `npm run check` dans ce projet. J'aurais aimé mettre en place une CI et implémenter le senseur d'architecture proposé en semaine 8 (sens des imports dans le frontend).
- **Mesurer le coût réel d'un harnais.** Savoir quand un guide ou un senseur supplémentaire vaut le temps et les crédits qu'il coûte.
