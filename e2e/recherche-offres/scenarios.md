# Recherche d'offres par titre (EF-30) — scénarios end-to-end

Règles (semaine 9, `docs/semaine-4.md`) : recherche dans le titre, sans tenir compte de la casse ni des espaces autour ; recherche vide = offres accessibles ; sans correspondance, liste vide et message adapté ; combinée avec la période ; un étudiant ne voit que les offres publiées.

## État initial commun

- Base de démonstration réinitialisée avec `npm run db:reset`, puis application lancée avec `npm run dev` (frontend sur http://localhost:5173).
- Offres utilisées (données de démonstration) :
  - « Application React de gestion de flotte » : publiée, P2 ;
  - « Migration d'une application vers le cloud » : attribuée (non publiée), P2 ;
  - « Refonte du portail client » : soumise (non publiée), P2.
- Les scénarios ne modifient aucune donnée (lecture seule).

## Scénario 1 — Recherche avec résultat, visibilité étudiant

| | |
|---|---|
| Rôle | Étudiant : Lucas Dupont (connexion de démonstration) |
| Actions | Aller sur la page « Offres ». Saisir `  APPLICATION  ` (majuscules et espaces autour) dans « Rechercher par titre ». |
| Résultat attendu | Le compteur affiche « 1 offre ». Le tableau contient une seule ligne : « Application React de gestion de flotte », statut « Publiée ». « Migration d'une application vers le cloud » n'apparaît pas, car elle n'est pas publiée. |

## Scénario 2 — Recherche sans résultat visible

| | |
|---|---|
| Rôle | Étudiant : Lucas Dupont |
| Actions | Aller sur la page « Offres ». Saisir `portail` dans « Rechercher par titre ». Puis effacer le champ. |
| Résultat attendu | Après la saisie : aucun tableau, le message « Aucune offre ne correspond à la recherche. » est affiché ; l'offre « Refonte du portail client » existe mais n'est pas publiée, elle ne doit pas apparaître. Après l'effacement : la liste des offres publiées revient (« 4 offres »). |
