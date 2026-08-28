import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const U=process.env.URL||'http://127.0.0.1:8123/index.html';
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?'  PASS ':'  FAIL ')+m);};
const b=await chromium.launch();

console.log('\n=== balises de partage ===');
{
  const c=await b.newContext({...devices['iPhone 14 Pro'],locale:'fr-FR'});const p=await c.newPage();
  await p.goto(U);
  const og=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]')]
    .map(m=>[m.getAttribute('property')||m.getAttribute('name'),m.content])));
  ok(og['og:title']==='Ma Marge', `og:title = ${og['og:title']}`);
  ok(/^https:\/\//.test(og['og:image']), `og:image absolue : ${og['og:image']}`);
  ok(og['og:image:width']==='1200'&&og['og:image:height']==='630','dimensions déclarées 1200×630');
  ok(og['twitter:card']==='summary_large_image','carte Twitter grand format');
  // l'adresse déclarée est absolue (github.io) : on vérifie le fichier servi par le site
  const nom=og['og:image'].split('/').pop();
  const r=await p.evaluate(async n=>{const x=await fetch(n);return {s:x.status,t:x.headers.get('content-type')};},nom);
  ok(r.s===200&&/image\/png/.test(r.t), `le fichier ${nom} est bien servi : ${r.s} ${r.t}`);
  await c.close();
}

console.log('\n=== bandeau d’installation — iPhone ===');
{
  const c=await b.newContext({...devices['iPhone 14 Pro'],locale:'fr-FR'});const p=await c.newPage();
  await p.goto(U);
  await p.waitForSelector('#install.show',{timeout:4000});
  ok(true,'le bandeau apparaît tout seul (Safari n’a pas de bouton natif)');
  await p.click('#installgo');
  const t=await p.textContent('#aide-install');
  ok(/Sur l'écran d'accueil/.test(t)&&/Partager/.test(t), 'il explique Partager → Sur l’écran d’accueil');
  ok(!/Android/.test(t),'pas d’instructions Android sur iPhone');
  await p.click('#installx');
  ok(!(await p.locator('#install').isVisible()),'la croix le masque');
  await p.reload();
  await p.waitForTimeout(400);
  ok(!(await p.locator('#install').isVisible()),'et il ne revient pas au rechargement');
  await c.close();
}

console.log('\n=== bandeau d’installation — Android ===');
{
  const c=await b.newContext({...devices['Pixel 7'],locale:'fr-FR'});const p=await c.newPage();
  await p.goto(U);
  await p.waitForTimeout(400);
  ok(!(await p.locator('#install').isVisible()),'rien dans les premières secondes');
  // on simule l'evenement que Chrome emet sur un vrai telephone
  await p.evaluate(()=>{const e=new Event('beforeinstallprompt');
    e.prompt=()=>{window.__prompt=true;};
    e.userChoice=Promise.resolve({outcome:'accepted'});
    dispatchEvent(e);});
  await p.waitForSelector('#install.show',{timeout:3000});
  ok(true,'le bandeau apparaît quand Chrome le signale');
  await p.click('#installgo');
  ok(await p.evaluate(()=>window.__prompt===true),'le bouton déclenche la vraie installation Chrome');
  await p.waitForTimeout(200);
  ok(!(await p.locator('#install').isVisible()),'et disparaît une fois acceptée');
  await c.close();
}

console.log('\n=== Android : Chrome reste muet (navigateur intégré, critères non remplis) ===');
{
  const c=await b.newContext({...devices['Pixel 7'],locale:'fr-FR'});const p=await c.newPage();
  await p.goto(U);
  await p.waitForSelector('#install.show',{timeout:8000});
  ok(true,'le bandeau finit par apparaître quand même');
  await p.click('#installgo');
  const t=await p.textContent('#aide-install');
  ok(/Installer l'application/.test(t)&&/⋮/.test(t),'il explique le menu ⋮ de Chrome');
  ok(/WhatsApp/.test(t),'et prévient pour les navigateurs intégrés');
  await c.close();
}

console.log('\n=== une fois installée, plus de bandeau ===');
{
  const c=await b.newContext({...devices['iPhone 14 Pro'],locale:'fr-FR'});const p=await c.newPage();
  await p.addInitScript(()=>{const m=matchMedia;window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:m(q);});
  await p.goto(U);
  await p.waitForTimeout(4500);          // au-delà du délai de repli
  ok(!(await p.locator('#install').isVisible()),'aucun bandeau en mode application');
  await c.close();
}

console.log('\n=== densité ===');
for (const d of ['iPhone SE','iPhone 14 Pro']) {
  const c=await b.newContext({...devices[d],locale:'fr-FR'});const p=await c.newPage();
  await p.goto(U);
  await p.fill('.ing .nom','Steak');await p.fill('.ing [data-k=pk]','12,50');await p.fill('.ing [data-k=g]','150');
  await p.fill('#prix','12,90');
  const m=await p.evaluate(()=>({h:document.documentElement.scrollHeight,v:innerHeight,
    sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  ok(m.sw<=m.cw+1, `${d} : pas de scroll horizontal`);
  console.log(`        ${d} : ${(m.h/m.v).toFixed(2)} écrans (avant : ${d==='iPhone SE'?'3,16':'2,62'})`);
  await c.close();
}
await b.close();
console.log(f?`\n### ${f} ÉCHEC(S)`:'\n### TOUT PASSE');
process.exit(f?1:0);
