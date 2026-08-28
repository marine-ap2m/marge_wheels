# Tests

Deux suites, jouées dans un vrai navigateur (Chromium via Playwright), sur des
formats de téléphone réels.

**`mobile.mjs`** — l'écran de calcul, sur iPhone SE (320 px), iPhone 14 Pro et
Pixel 7 :

- la saisie à la française (`12,50` autant que `12.50`) ;
- les prix conseillés ×2,1 / ×2,5 / ×3 / ×4 en TTC, TVA 10 % et 20 % ;
- les verdicts juste en dessous et juste au-dessus des seuils 2,5 et 3, et le
  fait que le coefficient affiché ne contredit jamais la couleur ;
- l'absence de débordement horizontal, les zones tactiles ≥ 44 px, les champs
  visibles ≥ 16 px (sinon iOS zoome tout seul) ;
- le service worker, le manifeste, et l'ouverture hors-ligne.

**`plats.mjs`** — la carte enregistrée :

- l'appli s'ouvre bien sur le calcul, jamais sur la liste ;
- enregistrer, rouvrir, modifier, ré-enregistrer sans dupliquer, supprimer ;
- le refus des enregistrements incomplets ;
- le tri (rouges d'abord) et les compteurs de synthèse ;
- l'export PDF de toute la carte et la fiche d'un plat seul ;
- la sauvegarde en fichier et sa restauration ;
- la reprise des données de la version précédente de l'appli ;
- la mise en page de la liste à 320 px.

**`install.mjs`** — l'installation et le partage :

- les balises d'aperçu (`og:`), l'adresse absolue de l'image et le fichier servi ;
- le bandeau d'installation : proposé d'emblée sur iPhone (Safari n'a pas de
  bouton natif), seulement sur signal de Chrome sur Android, jamais quand
  l'appli tourne déjà en mode application ;
- les instructions adaptées à la plateforme, et la croix qui masque le bandeau
  pour de bon ;
- la hauteur de page en nombre d'écrans, garde-fou contre le retour de la
  mise en page trop aérée.

Pour les lancer :

```sh
npx --yes http-server -p 8123 -s .      # dans un terminal
node tests/mobile.mjs                   # dans un autre
node tests/plats.mjs
node tests/install.mjs
```
