# Mettre « Ma Marge » en ligne, gratuitement

Deux chemins. **GitHub Pages** est celui à suivre : l'appli est déjà dans ton
dépôt GitHub, l'adresse est permanente, et chaque modification future se
publiera toute seule. Netlify Drop est en bas, comme dépannage.

---

## GitHub Pages — 5 minutes, une seule fois

### 1. Publier la branche

L'appli est sur la branche `claude/ma-marge-pwa-review-deploy-9g3gc3`.
GitHub Pages publie plus simplement depuis `main`. Sur
<https://github.com/marine-ap2m/marge_wheels> :

- onglet **Pull requests** → **New pull request** ;
- base `main`, compare `claude/ma-marge-pwa-review-deploy-9g3gc3` ;
- **Create pull request**, puis **Merge pull request**.

(Si le dépôt n'a pas encore de branche `main`, GitHub te propose directement de
faire de cette branche la branche par défaut : accepte, c'est équivalent.)

### 2. Activer Pages

Toujours sur le dépôt : **Settings** (roue dentée, en haut) → **Pages** (menu de
gauche) → sous *Build and deployment* :

- **Source** : `Deploy from a branch`
- **Branch** : `main`, dossier `/ (root)`
- **Save**

### 3. Attendre 1 à 2 minutes

Recharge la page Settings → Pages. GitHub affiche en haut :

> Your site is live at **https://marine-ap2m.github.io/marge_wheels/**

C'est ton adresse. Elle ne changera plus.

> Si l'onglet **Pages** n'apparaît pas, c'est que le dépôt est privé : va dans
> Settings → tout en bas, **Change repository visibility** → **Public**. Pages
> est gratuit sur les dépôts publics. Le code de l'appli devient visible ; les
> données de tes plats, elles, restent dans ton téléphone et ne sont jamais
> publiées.

### 4. Installer sur le téléphone

Ouvre cette adresse **sur le téléphone**, puis :

- **iPhone** — il faut **Safari** (Chrome sur iPhone ne sait pas installer) :
  bouton Partager (le carré avec la flèche, en bas) → descendre → **Sur l'écran
  d'accueil** → **Ajouter**.
- **Android** — Chrome : menu **⋮** en haut à droite → **Installer
  l'application** (ou *Ajouter à l'écran d'accueil*).

L'icône € arrive sur l'écran d'accueil. Ouvre-la : plein écran, sans barre de
navigateur, et **ça marche sans réseau** — utile en cuisine ou en cave.

---

## Ensuite : modifier l'appli

Chaque fois qu'une modification est poussée sur `main`, GitHub Pages republie
tout seul en une minute environ. Sur le téléphone, l'appli affiche alors un
bandeau **« Nouvelle version disponible — Mettre à jour »**. Un appui, c'est
fait. Rien à réinstaller, et la saisie en cours n'est jamais interrompue par un
rechargement surprise.

⚠️ Une seule règle pour que ça marche : à chaque mise en ligne, **changer le
numéro de version en haut de `sw.js`** (`mamarge-v2` → `mamarge-v3`, etc.).
Sans ça, les téléphones qui ont déjà l'appli gardent l'ancienne version en
mémoire.

---

## Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Page blanche, ou 404 | Pages pas encore construit | attendre 2 min, recharger |
| Pas de « Sur l'écran d'accueil » sur iPhone | tu es dans Chrome | rouvrir le lien dans Safari |
| Le téléphone garde l'ancienne version | numéro de version de `sw.js` inchangé | l'incrémenter et repousser |
| Vraiment coincé sur une vieille version | cache tenace | iPhone : Réglages → Safari → Effacer historique. Android : appui long sur l'icône → Infos appli → Stockage → Vider le cache |

---

## Solution de secours — Netlify Drop (2 min, sans compte)

Utile seulement pour montrer l'appli tout de suite à quelqu'un.

1. Sur un ordinateur : <https://app.netlify.com/drop>
2. Glisser-déposer le dossier contenant `index.html` dans la page.
3. Netlify donne un lien `https://…netlify.app` — à ouvrir sur le téléphone.

⚠️ Sans compte Netlify, ce lien **expire**. Et il n'est pas relié à ton dépôt :
tes futures modifications n'y arriveront pas. Pour de bon, c'est GitHub Pages.

---

AP2M Gestion® — Propriété intellectuelle, marque déposée.
