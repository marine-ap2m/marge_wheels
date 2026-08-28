# Mettre « Ma Marge » en ligne, gratuitement

Deux chemins. **GitHub Pages** est celui à suivre : l'appli est déjà dans ton
dépôt GitHub, l'adresse est permanente, et chaque modification future se
publiera toute seule. Netlify Drop est en bas, comme dépannage.

---

## GitHub Pages — 5 minutes, une seule fois

### 1. Activer Pages

Le code est déjà fusionné dans la branche `main` — il n'y a rien à publier.

Sur <https://github.com/marine-ap2m/marge_wheels> : **Settings** (roue dentée, en haut) → **Pages** (menu de
gauche) → sous *Build and deployment* :

- **Source** : `Deploy from a branch`
- **Branch** : `main`, dossier `/ (root)`
- **Save**

### 2. Attendre 1 à 2 minutes

Recharge la page Settings → Pages. GitHub affiche en haut :

> Your site is live at **https://marine-ap2m.github.io/marge_wheels/**

C'est ton adresse. Elle ne changera plus.

> Si l'onglet **Pages** n'apparaît pas, c'est que le dépôt est privé : va dans
> Settings → tout en bas, **Change repository visibility** → **Public**. Pages
> est gratuit sur les dépôts publics. Le code de l'appli devient visible ; les
> données de tes plats, elles, restent dans ton téléphone et ne sont jamais
> publiées.

### 3. Installer sur le téléphone

Ouvre cette adresse **sur le téléphone**, puis :

L'appli affiche elle-même un bandeau **« Ajoute-la à ton écran d'accueil »** avec
un bouton *Installer*. Sur Android il fait tout ; sur iPhone il affiche les trois
gestes à faire, parce que Safari n'a pas de bouton d'installation — c'est normal,
il n'en a jamais eu.

- **iPhone** — il faut **Safari** (Chrome sur iPhone ne sait pas installer) :
  bouton Partager (le carré avec la flèche, en bas) → descendre → **Sur l'écran
  d'accueil** → **Ajouter**.
- **Android** — Chrome : menu **⋮** en haut à droite → **Installer
  l'application** (ou *Ajouter à l'écran d'accueil*).

⚠️ Ouvert depuis WhatsApp ou Messenger, le lien s'affiche dans le navigateur
intégré de l'application, qui **ne sait pas installer**. Il faut rouvrir le lien
dans Safari ou Chrome.

L'icône € arrive sur l'écran d'accueil. Ouvre-la : plein écran, sans barre de
navigateur, et **ça marche sans réseau** — utile en cuisine ou en cave.

---

---

## Ce qu'il faut lui dire, en deux minutes

Une fois le lien envoyé et l'icône installée, il n'y a plus rien à expliquer de
technique. Le tour du propriétaire tient en cinq phrases :

1. **L'appli s'ouvre toujours sur le calcul.** Nom du plat, puis chaque
   ingrédient : son prix au kilo et le poids utilisé. Le coût se calcule tout
   seul. La virgule fonctionne (`12,50`).
2. **En bas, tu entres ton prix de carte, TTC.** L'appli répond tout de suite :
   🔴 tu perds · 🟠 limite · ✅ tu gagnes. Objectif : au moins ×3.
3. **« Enregistrer ce plat »** l'ajoute à ta carte. Un bouton *Mes plats*
   apparaît alors en haut — c'est là que tu vois d'un coup d'œil combien sont en
   rouge.
4. **Dans Mes plats**, les rouges sont en premier. Touche un plat pour le
   rouvrir, changer un prix, ré-enregistrer.
5. **« Exporter toute la carte (PDF) »** sort la synthèse complète, à imprimer ou
   à envoyer.

Deux choses à lui dire une fois, parce qu'elles ne se devinent pas :

- **Ses plats sont dans son téléphone, pas sur internet.** Personne d'autre ne
  les voit ; c'est aussi pour ça qu'il faut utiliser *Sauvegarder mes plats*
  avant de changer d'appareil.
- **Si un bandeau noir « Nouvelle version disponible » apparaît**, il suffit
  d'appuyer. Rien à réinstaller.

---

## Ensuite : modifier l'appli

Chaque fois qu'une modification est poussée sur `main`, GitHub Pages republie
tout seul en une minute environ. Sur le téléphone, l'appli affiche alors un
bandeau **« Nouvelle version disponible — Mettre à jour »**. Un appui, c'est
fait. Rien à réinstaller, et la saisie en cours n'est jamais interrompue par un
rechargement surprise.

⚠️ Une seule règle pour que ça marche : à chaque mise en ligne, **changer le
numéro de version en haut de `sw.js`** (`mamarge-v5` → `mamarge-v6`, etc.).
Sans ça, les téléphones qui ont déjà l'appli gardent l'ancienne version en
mémoire.

---

## Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Page blanche, ou 404 | Pages pas encore construit | attendre 2 min, recharger |
| Pas de « Sur l'écran d'accueil » sur iPhone | tu es dans Chrome | rouvrir le lien dans Safari |
| Le téléphone garde l'ancienne version | numéro de version de `sw.js` inchangé | l'incrémenter et repousser |
| Pas de vignette quand on envoie le lien | l'application a mis le lien en cache sans aperçu | renvoyer le lien ; WhatsApp garde son cache un moment |
| Pas de bouton « Installer » du navigateur | normal sur iPhone, et dans les navigateurs intégrés | utiliser le bandeau de l'appli, ou rouvrir dans Safari / Chrome |
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
