import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const URL='http://127.0.0.1:8123/index.html';
let fails=0;
const ok=(c,m)=>{ if(!c) fails++; console.log((c?'  PASS ':'  FAIL ')+m); };

const browser = await chromium.launch();

for (const name of ['iPhone SE','iPhone 14 Pro','Pixel 7']) {
  const ctx = await browser.newContext({ ...devices[name], locale:'fr-FR' });
  const page = await ctx.newPage();
  await page.goto(URL);
  const vw = page.viewportSize().width;
  console.log(`\n=== ${name} (${vw}px) ===`);

  // saisie a la francaise : virgule decimale
  await page.fill('#dish','Burger maison');
  await page.fill('.ing .nom','Steak haché');
  await page.fill('.ing [data-k=pk]','12,50');
  await page.fill('.ing [data-k=g]','150');
  const cout = await page.textContent('#cout');
  ok(cout==='1,88 €', `virgule décimale : 12,50 €/kg × 150 g = ${cout} (attendu 1,88 €)`);

  await page.click('#add');
  await page.waitForTimeout(80);   // l'appli place le curseur sur la nouvelle ligne (30 ms)
  await page.fill('.ing:last-child .nom','Pain "brioché"');   // guillemets = piege d echappement
  await page.fill('.ing:last-child [data-k=pk]','6.20');       // point decimal aussi
  await page.fill('.ing:last-child [data-k=g]','80');
  const cout2 = await page.textContent('#cout');
  ok(cout2==='2,37 €', `total 2 ingrédients = ${cout2} (attendu 2,37 €)`);

  await page.click('#add');
  await page.waitForTimeout(80);
  const nom1 = await page.inputValue('.ing:nth-child(2) .nom');
  ok(nom1==='Pain "brioché"', `guillemets conservés après re-render : ${JSON.stringify(nom1)}`);

  // prix conseilles TTC (TVA 10%) sur un cout de 2,375
  const [c21,c25,c3,c4] = await Promise.all(['#c21','#c25','#c3','#c4'].map(s=>page.textContent(s)));
  ok(c21==='5,48 €' && c25==='6,52 €' && c3==='7,82 €' && c4==='10,43 €',
     `prix TTC ×2,1 ${c21} · ×2,5 ${c25} · ×3 ${c3} · ×4 ${c4}`);

  // verdicts aux seuils, coefficient HT = prixTTC/1,10 / cout
  const cas = [
    ['6,00','v-bad','TU PERDS'],           // coef 2,30
    ['6,51','v-bad','TU PERDS'],           // coef 2,4962 : juste SOUS le seuil 2,5
    ['6,53','v-warn','LIMITE'],            // coef 2,5039 : juste au-dessus
    ['7,82','v-warn','LIMITE'],            // coef 2,9984 : juste SOUS 3
    ['7,83','v-good','TU GAGNES'],         // coef 3,0022 : juste au-dessus
    ['10,43','v-good','TU GAGNES'],        // coef 3,9992
  ];
  for (const [p,cls,msg] of cas) {
    await page.fill('#prix',p);
    const cl = await page.getAttribute('#verdict','class');
    const sub = (await page.textContent('#verdict .sub')).replace(/\s+/g,' ');
    ok(cl.includes(cls) && (await page.textContent('#verdict .msg'))===msg,
       `prix ${p} € TTC → ${msg} | ${sub}`);
    // le coefficient affiche ne doit jamais contredire la couleur
    const m = sub.match(/×(\d+),(\d)/);
    if (m) {
      const shown = parseFloat(m[1]+'.'+m[2]);
      const coherent = cls==='v-good' ? shown>=3 : cls==='v-warn' ? (shown>=2.5&&shown<3) : shown<2.5;
      ok(coherent, `    coefficient affiché ×${m[1]},${m[2]} cohérent avec ${cls}`);
    }
  }

  // TVA 20 % alcool
  await page.click('#tva button[data-t="0.20"]');
  const c3b = await page.textContent('#c3');
  ok(c3b==='8,54 €', `TVA 20 % : ×3 = ${c3b} (attendu 8,54 €)`);
  await page.click('#tva button[data-t="0.10"]');

  // debordement horizontal ?
  const scroll = await page.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
  ok(scroll.sw<=scroll.cw+1, `pas de scroll horizontal (${scroll.sw} ≤ ${scroll.cw})`);

  // aucun texte de prix tronque / deborde de sa carte
  const over = await page.evaluate(()=>{
    const bad=[];
    for (const el of document.querySelectorAll('.price b, .refline b, .cost-big b, .seg button')) {
      if (el.scrollWidth > el.clientWidth+1) bad.push(el.textContent.trim()+' ('+el.scrollWidth+'>'+el.clientWidth+')');
    }
    return bad;
  });
  ok(over.length===0, `aucun débordement de texte ${over.length?JSON.stringify(over):''}`);

  // zones tactiles >= 44px
  const small = await page.evaluate(()=>{
    const bad=[];
    for (const el of document.querySelectorAll('button, input')) {
      const r=el.getBoundingClientRect();
      // 43,5 : tolérance à l'arrondi sous-pixel d'un min-height:44px
      if (r.height>0 && r.height<43.5) bad.push((el.id||el.className||el.tagName)+' h='+r.height.toFixed(2));
    }
    return bad;
  });
  ok(small.length===0, `toutes les cibles tactiles ≥ 44px ${small.length?JSON.stringify(small):''}`);

  // taille de police des champs >= 16px (sinon iOS zoome tout seul)
  const zoom = await page.evaluate(()=>[...document.querySelectorAll('input')]
    .filter(e=>e.getBoundingClientRect().height>0)
    .map(e=>parseFloat(getComputedStyle(e).fontSize)).filter(s=>s<16));
  ok(zoom.length===0, `champs ≥ 16px, pas de zoom auto iOS ${zoom.length?JSON.stringify(zoom):''}`);

  // suppression d ingredient
  const before = await page.locator('.ing').count();
  await page.locator('.ing .del').first().click();
  ok(await page.locator('.ing').count()===before-1, `suppression d'un ingrédient`);

  // persistance
  await page.reload();
  ok(await page.inputValue('#dish')==='Burger maison', `plat conservé après rechargement`);
  ok(await page.inputValue('.ing [data-k=pk]')!=='' , `prix/kg conservé après rechargement`);

  if (name==='iPhone SE') await page.screenshot({path:'/tmp/claude-0/-home-user-marge-wheels/ae5b1ddd-e2e1-5295-b3fd-d2303f105530/scratchpad/se.png', fullPage:true});
  if (name==='iPhone 14 Pro') await page.screenshot({path:'/tmp/claude-0/-home-user-marge-wheels/ae5b1ddd-e2e1-5295-b3fd-d2303f105530/scratchpad/ip14.png', fullPage:true});
  await ctx.close();
}

// service worker + manifeste + hors-ligne
console.log('\n=== PWA ===');
{
  const ctx = await browser.newContext({...devices['Pixel 7'], locale:'fr-FR'});
  const page = await ctx.newPage();
  const errs=[]; page.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await page.goto(URL);
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null, null, {timeout:15000}).catch(()=>{});
  ok(await page.evaluate(()=>!!navigator.serviceWorker.controller), 'service worker actif');
  const man = await page.evaluate(async()=>(await fetch('manifest.webmanifest')).status);
  ok(man===200, 'manifest.webmanifest servi (200)');
  ok(errs.length===0, `aucune erreur console ${errs.length?JSON.stringify(errs):''}`);
  await ctx.setOffline(true);
  await page.reload();
  ok((await page.title())==='Ma Marge', 'l’appli s’ouvre hors-ligne');
  await ctx.close();
}

await browser.close();
console.log(fails? `\n### ${fails} ÉCHEC(S)` : '\n### TOUT PASSE');
process.exit(fails?1:0);
