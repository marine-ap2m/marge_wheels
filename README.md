# Ma Marge

PWA de calcul de rentabilité d'un plat, pour un restaurateur.

Un ingrédient = nom + prix au kg + poids en grammes.
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

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | toute l'appli (aucune dépendance, aucun réseau) |
| `manifest.webmanifest` | nom, icônes, couleurs de l'appli installée |
| `sw.js` | fonctionnement hors-ligne + bandeau de mise à jour |
| `icon-*.png`, `favicon.png` | icônes € assiette |
| `MISE-EN-LIGNE.md` | comment publier, pas à pas |

Les données restent dans le téléphone (`localStorage`), rien n'est envoyé nulle part.

---

AP2M Gestion® — Propriété intellectuelle, marque déposée.
