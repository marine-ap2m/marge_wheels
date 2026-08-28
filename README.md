# Ma Marge

PWA de calcul de rentabilité, pour un restaurateur. Aucune dépendance, aucun
serveur, aucun compte : tout tient dans un fichier HTML et fonctionne hors-ligne.

Un ingrédient = nom + prix au kg + **poids par plat**, en grammes : la quantité
servie dans une assiette, pas la quantité achetée.
Coût de revient = somme de `prix au kg × grammes ÷ 1000`.

## Coefficients de la stratégie

| Coefficient | Sens | Verdict |
|---|---|---|
| ×2,1 | niveau actuel — on perd | rouge |
| ×2,5 | le seuil | rouge en dessous |
| ×3 | conseillé | orange entre 2,5 et 3 |
| ×4 | confort | vert à partir de ×3 |

Le coefficient est calculé **hors taxes** : `(prix carte TTC ÷ (1 + TVA)) ÷ coût de revient`.
TVA 10 % sur les plats, 20 % sur l'alcool. Les prix en carte sont affichés en TTC.

## Les deux écrans

**1. Le calcul** — c'est ce qui s'ouvre. Nom du plat, ingrédients, prix de vente,
verdict immédiat. Un bouton « Enregistrer ce plat » l'ajoute à la carte.

**2. Mes plats** — accessible depuis le calcul, et seulement une fois un plat
enregistré. Compte des rouges / limites / verts en tête, puis la liste triée
avec les rouges d'abord. Toucher un plat le rouvre dans l'écran de calcul.

## Ce qui sort en PDF

- **La fiche d'un plat** : ses ingrédients, son coût, les quatre prix conseillés,
  son verdict.
- **Toute la carte** : un tableau de synthèse coloré par verdict, puis le détail
  de chaque plat. Depuis « Mes plats ».

Les deux passent par l'impression du navigateur → « Enregistrer au format PDF ».

## Taille du texte

Les tailles de police sont fluides (`clamp()` en `vw`) : sur un écran de 360 px
le texte est environ 12 % plus petit que sur un 412 px, au lieu d'être figé.

L'échelle tient en cinq variables définies sur `:root`. **`--t-md` est la
référence** — c'est la taille des titres de carte (« Les ingrédients »), et tout
le reste se place autour :

| Variable | Usage |
|---|---|
| `--t-xs` | mentions, notes de bas de carte |
| `--t-sm` | texte secondaire |
| `--t-md` | **référence** : titres de carte, boutons, prix conseillés |
| `--t-lg` | chiffres mis en avant (coût total, coefficient dans la liste) |
| `--t-xl` | verdict, titres d'écran |

Deux planchers restent volontairement fixes et échappent à l'échelle : **44 px**
de haut pour toute cible tactile, et **16 px** pour les champs de saisie — en
dessous, iOS zoome de lui-même sur le champ à chaque fois qu'on le touche.

Cela ne compense pas l'agrandissement du texte réglé au niveau du système
(Android : Paramètres → Affichage → Taille de police ; Chrome → Paramètres →
Accessibilité → Mise à l'échelle du texte). C'est un choix de l'utilisateur, et
il est respecté.

## Installation sur le téléphone

Un bandeau « Ajoute-la à ton écran d'accueil » s'affiche tant que l'appli n'est
pas installée. Sur Android il déclenche l'installation de Chrome ; sur iPhone il
affiche la marche à suivre, Safari n'ayant pas de bouton d'installation. Il
disparaît une fois l'appli installée, et la croix le masque définitivement.

## Aperçu quand on envoie le lien

Les balises `og:` en tête de `index.html` produisent la vignette affichée par
WhatsApp, les SMS et Messenger. **`og:url` et `og:image` doivent rester des
adresses absolues** — ces applications ne résolvent pas les chemins relatifs —
donc à corriger si le site change d'adresse. L'image est `apercu-partage.png`
(1200 × 630).

## Les données

Elles vivent dans le téléphone (`localStorage`), rien n'est envoyé nulle part.
Le plat en cours de saisie est enregistré en continu : fermer l'appli ne perd
rien. « Mes plats », lui, ne change que sur enregistrement explicite.

Un bouton **Sauvegarder mes plats** produit un fichier `.json` à conserver — à
faire avant de changer de téléphone, puisque rien n'est synchronisé en ligne.
**Restaurer une sauvegarde** le relit.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | toute l'appli |
| `manifest.webmanifest` | nom, icônes, couleurs de l'appli installée |
| `sw.js` | hors-ligne + bandeau de mise à jour |
| `icon-*.png`, `favicon.png` | icônes € assiette |
| `MISE-EN-LIGNE.md` | comment publier, pas à pas |
| `tests/` | vérifications en navigateur réel |

## Modifier l'appli

À chaque mise en ligne, **incrémenter le numéro de version en haut de `sw.js`**
(`mamarge-v6` → `mamarge-v7`). Sans ça, les téléphones qui ont déjà l'appli
gardent l'ancienne version en mémoire.

---

AP2M Gestion® — Propriété intellectuelle, marque déposée.
