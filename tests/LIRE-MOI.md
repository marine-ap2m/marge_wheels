# Tests

`mobile.mjs` vérifie l'appli dans un vrai navigateur, sur trois formats de
téléphone (iPhone SE 320 px, iPhone 14 Pro, Pixel 7) :

- la saisie à la française (`12,50` autant que `12.50`) ;
- les prix conseillés ×2,1 / ×2,5 / ×3 / ×4 en TTC, TVA 10 % et 20 % ;
- les verdicts juste en dessous et juste au-dessus des seuils 2,5 et 3, et le
  fait que le coefficient affiché ne contredit jamais la couleur ;
- l'absence de débordement horizontal, les zones tactiles ≥ 44 px, les champs
  ≥ 16 px (sinon iOS zoome tout seul) ;
- le service worker, le manifeste, et l'ouverture hors-ligne.

Pour le lancer :

```sh
npx --yes http-server -p 8123 -s .      # dans un terminal
node tests/mobile.mjs                   # dans un autre
```
