import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const URL = process.env.URL || 'http://127.0.0.1:8123/index.html';
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '  PASS ' : '  FAIL ') + m); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 14 Pro'], locale: 'fr-FR' });
const page = await ctx.newPage();
const errs = []; page.on('console', m => m.type() === 'error' && errs.push(m.text()));

// saisit un plat complet dans l'ecran de calcul, puis l'enregistre
async function saisir(nom, ings, prix, tva) {
  await page.evaluate(() => {
    state = { id: null, dish: '', tva: 0.10, prix: '', ings: [{ nom: '', pk: '', g: '' }] };
    document.querySelector('#dish').value = ''; document.querySelector('#prix').value = ''; render();
  });
  await page.fill('#dish', nom);
  for (let i = 0; i < ings.length; i++) {
    if (i) await page.click('#add');
    const r = `.ing:nth-child(${i + 1})`;
    await page.fill(`${r} .nom`, ings[i][0]);
    await page.fill(`${r} [data-k=pk]`, ings[i][1]);
    await page.fill(`${r} [data-k=g]`, ings[i][2]);
  }
  if (tva) await page.click(`#tva button[data-t="${tva}"]`);
  await page.fill('#prix', prix);
}

await page.goto(URL);

console.log('\n=== l’écran d’ouverture reste le calcul ===');
ok(await page.locator('#vue-calc').isVisible(), 'la page qui s’ouvre est le calcul de marge');
ok(!(await page.locator('#vue-plats').isVisible()), 'la liste n’est pas la page d’accueil');
ok(!(await page.locator('#versplats').isVisible()), 'aucun accès « Mes plats » tant que rien n’est enregistré');
ok(await page.locator('#verdict').isVisible(), 'le verdict est visible dès l’ouverture');

console.log('\n=== enregistrer un plat ===');
await saisir('Burger maison', [['Steak', '12,50', '150'], ['Pain', '6,20', '80']], '12,90');
ok((await page.textContent('#enr')).includes('Enregistrer ce plat'), 'bouton « Enregistrer ce plat »');
await page.click('#enr');
ok((await page.textContent('#enr')).includes('Plat enregistré'), 'après enregistrement le bouton confirme');
ok(await page.locator('#versplats').isVisible(), 'l’accès « Mes plats » apparaît');

// refus des enregistrements incomplets
await page.evaluate(() => { state = { id: null, dish: '', tva: .1, prix: '', ings: [{ nom: '', pk: '', g: '' }] }; document.querySelector('#dish').value = ''; render(); });
await page.click('#enr');
ok(await page.locator('#flash').isVisible(), 'plat sans nom : refusé avec un message');
ok(await page.evaluate(() => plats.length) === 1, 'aucun plat fantôme ajouté');

console.log('\n=== une carte de 4 plats ===');
await saisir('Salade chèvre', [['Chèvre', '14,00', '60'], ['Salade', '3,50', '100']], '9,50');   // coef ~5,9 vert
await page.click('#enr');
await saisir('Frites maison', [['Pommes de terre', '1,80', '250']], '3,20');                     // coef ~6,4 vert
await page.click('#enr');
await saisir('Plateau fromage', [['Fromages', '22,00', '120']], '6,50');                         // coef ~2,2 rouge
await page.click('#enr');
ok(await page.evaluate(() => plats.length) === 4, '4 plats enregistrés');

// verification des verdicts calcules
const st = await page.evaluate(() => plats.map(p => ({ n: p.nom, st: analyse(p).st, c: +analyse(p).coef.toFixed(2) })));
console.log('   ', JSON.stringify(st));
ok(st.find(x => x.n === 'Plateau fromage').st === 'bad', 'Plateau fromage (×2,2) → rouge');
ok(st.find(x => x.n === 'Burger maison').st === 'good', 'Burger maison (×3,9) → vert');

console.log('\n=== la liste ===');
await page.click('#versplats');
ok(await page.locator('#vue-plats').isVisible() && !(await page.locator('#vue-calc').isVisible()), 'on bascule sur la liste');
const synth = await page.locator('.synth').textContent();
ok(/1enrouge/.test(synth.replace(/\s/g, '')), `synthèse en tête : ${synth.replace(/\s+/g, ' ').trim()}`);
const ordre = await page.$$eval('.plat .nm', n => n.map(e => e.textContent));
ok(ordre[0] === 'Plateau fromage', `les rouges d’abord : ${JSON.stringify(ordre)}`);
const grp = await page.$$eval('.grp', n => n.map(e => e.textContent.trim()));
ok(grp[0].includes('À corriger en priorité'), `groupes : ${JSON.stringify(grp)}`);

console.log('\n=== ouvrir, modifier, ré-enregistrer ===');
await page.click('.plat .txt >> nth=0');
ok(await page.locator('#vue-calc').isVisible(), 'toucher un plat ramène au calcul');
ok(await page.inputValue('#dish') === 'Plateau fromage', 'le plat touché est chargé');
ok(await page.inputValue('#prix') === '6,50', 'son prix est chargé');
ok((await page.textContent('#enr')).includes('Plat enregistré'), 'plat inchangé : rien à ré-enregistrer');
await page.fill('#prix', '9,90');
ok((await page.textContent('#enr')).includes('Enregistrer les modifications'), 'après modification le bouton le signale');
await page.click('#enr');
ok(await page.evaluate(() => plats.length) === 4, 'ré-enregistrer met à jour, ne duplique pas');
ok(await page.evaluate(() => plats.find(p => p.nom === 'Plateau fromage').prix) === '9,90', 'le nouveau prix est enregistré');
ok(await page.evaluate(() => analyse(plats.find(p => p.nom === 'Plateau fromage')).st) === 'good', 'il passe au vert');

console.log('\n=== retour arrière du téléphone ===');
await page.click('#versplats');
await page.goBack();
ok(await page.locator('#vue-calc').isVisible(), 'le bouton retour d’Android revient au calcul');

console.log('\n=== export PDF de toute la carte ===');
await page.click('#versplats');
await page.evaluate(() => { window.print = () => { window.__imprime = true; }; });
await page.click('#pdfcarte');
const fiche = await page.textContent('#print');
ok(await page.evaluate(() => window.__imprime === true), 'l’impression est déclenchée');
ok(fiche.includes('Ma carte — 4 plats'), 'titre « Ma carte — 4 plats »');
for (const n of ['Burger maison', 'Salade chèvre', 'Frites maison', 'Plateau fromage'])
  ok(fiche.includes(n), `la carte contient « ${n} »`);
ok(fiche.includes('Steak') && fiche.includes('Pommes de terre'), 'le détail des ingrédients y est');
ok((fiche.match(/Prix conseillés \(TTC\)/g) || []).length === 4, 'un bloc de prix conseillés par plat');
ok(fiche.includes('AP2M Gestion® — Propriété intellectuelle, marque déposée.'), 'mention légale présente');
const dedans = await page.innerHTML('#print');
ok(dedans.includes('r-good') || dedans.includes('r-bad'), 'les lignes de synthèse sont colorées par verdict');

console.log('\n=== fiche d’un seul plat, toujours disponible ===');
await page.click('#retour');
await page.click('#pdf');
const f1 = await page.textContent('#print');
ok(f1.includes('Fiche : Plateau fromage') && !f1.includes('Burger maison'), 'la fiche du plat seul reste un plat seul');

console.log('\n=== tout survit à la fermeture de l’appli ===');
await page.reload();
ok(await page.evaluate(() => plats.length) === 4, 'les 4 plats sont toujours là');
ok(await page.inputValue('#dish') === 'Plateau fromage', 'le plat en cours est rouvert');
ok(await page.locator('#vue-calc').isVisible(), 'et on rouvre bien sur le calcul');

console.log('\n=== suppression ===');
await page.click('#versplats');
page.once('dialog', d => d.accept());
await page.click('.plat .sup >> nth=0');
ok(await page.evaluate(() => plats.length) === 3, 'un plat supprimé');

console.log('\n=== sauvegarde et restauration ===');
const dl = page.waitForEvent('download');
await page.click('#sauver');
const d = await dl;
const chemin = '/tmp/claude-0/-home-user-marge-wheels/ae5b1ddd-e2e1-5295-b3fd-d2303f105530/scratchpad/' + d.suggestedFilename();
await d.saveAs(chemin);
const { readFileSync } = await import('fs');
const json = JSON.parse(readFileSync(chemin, 'utf8'));
ok(/^ma-marge-\d{4}-\d{2}-\d{2}\.json$/.test(d.suggestedFilename()), `fichier ${d.suggestedFilename()}`);
ok(json.plats.length === 3, 'la sauvegarde contient les 3 plats');
page.once('dialog', dg => dg.accept());
await page.evaluate(() => { plats = []; save(); rendPlats(); });
await page.setInputFiles('#fichier', chemin);
await page.waitForFunction(() => plats.length === 3, null, { timeout: 5000 });
ok(true, 'restauration depuis le fichier : 3 plats retrouvés');

console.log('\n=== migration depuis l’ancienne version ===');
{
  const c2 = await browser.newContext({ ...devices['iPhone 14 Pro'], locale: 'fr-FR' });
  const p2 = await c2.newPage();
  await p2.goto(URL);
  await p2.evaluate(() => { localStorage.clear();
    localStorage.setItem('mamarge', JSON.stringify({ dish: 'Ancien plat', tva: 0.20, prix: '8,00',
      ings: [{ nom: 'Vin', pk: '9,00', g: '150' }] })); });
  await p2.reload();
  ok(await p2.inputValue('#dish') === 'Ancien plat', 'le plat de l’ancienne version est repris');
  ok(await p2.inputValue('.ing [data-k=pk]') === '9,00', 'ses ingrédients aussi');
  ok(await p2.evaluate(() => state.tva) === 0.20, 'sa TVA aussi');
  await c2.close();
}

console.log('\n=== mise en page de la liste sur petit écran ===');
{
  const c3 = await browser.newContext({ ...devices['iPhone SE'], locale: 'fr-FR' });
  const p3 = await c3.newPage();
  await p3.goto(URL);
  await p3.evaluate(() => {
    plats = [{ id: 'a', nom: 'Plateau de fromages affinés du Jura', tva: .1, prix: '6,50', ings: [{ nom: 'F', pk: '22', g: '120' }] },
             { id: 'b', nom: 'Frites', tva: .1, prix: '', ings: [{ nom: 'PDT', pk: '1,80', g: '250' }] },
             { id: 'c', nom: 'Tarte', tva: .1, prix: '', ings: [] }];
    save(); location.hash = '#plats';
  });
  await p3.waitForSelector('.plat');
  const sc = await p3.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(sc.sw <= sc.cw + 1, `liste : pas de scroll horizontal à 320 px (${sc.sw} ≤ ${sc.cw})`);
  const petites = await p3.evaluate(() => [...document.querySelectorAll('#vue-plats button')]
    .filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.height < 44; })
    .map(e => (e.className || e.id) + ' h=' + Math.round(e.getBoundingClientRect().height)));
  ok(petites.length === 0, `cibles tactiles ≥ 44 px ${petites.length ? JSON.stringify(petites) : ''}`);
  const grps = await p3.$$eval('.grp', n => n.map(e => e.textContent.trim()));
  ok(grps.some(g => g.includes('À compléter')), `un plat sans prix est rangé « à compléter » : ${JSON.stringify(grps)}`);
  const txt = await p3.textContent('#liste');
  ok(txt.includes('prix de vente à renseigner'), 'plat chiffré sans prix → « prix de vente à renseigner »');
  ok(txt.includes('ingrédients à renseigner'), 'plat vide → « ingrédients à renseigner »');
  await c3.close();
}

ok(errs.length === 0, `aucune erreur console ${errs.length ? JSON.stringify(errs) : ''}`);
await browser.close();
console.log(fails ? `\n### ${fails} ÉCHEC(S)` : '\n### TOUT PASSE');
process.exit(fails ? 1 : 0);
