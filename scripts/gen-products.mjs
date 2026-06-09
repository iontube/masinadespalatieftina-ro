// Generate the cheap washing-machines + dishwashers (<=2000 lei) dataset from pretulverde.db.
// Real appliances only (accessories/parts/dryers/ironing/detergents excluded). DEDUP across merchants ->
// one page per model+capacity+color, cheapest offer per merchant ("Vezi oferta pe X,Y,Z").
import Database from '/sites/pretulverde.ro/node_modules/better-sqlite3/lib/index.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DB = '/sites/pretulverde.ro/pretulverde.db';
const CAMPAIGN = JSON.parse(readFileSync('/sites/pretulverde.ro/_data/campaign.json', 'utf8'));
const AFF = '2ace29e87';
const IMG_HOST = 'https://img.masinadespalatieftina.ro';
const SITE_NAME = 'MasinaDeSpalatIeftina.ro';
const OUT = fileURLToPath(new URL('../src/data/masini.json', import.meta.url));

const db = new Database(DB, { readonly: true });
const SUBS = ['masini-de-spalat', 'masini-de-spalat-rufe', 'masini-de-spalat-rufe-cu-uscator', 'masini-de-spalat-10-12-kg', 'masini-de-spalat-8-9-kg', 'masini-de-spalat-6-7-kg', 'masini-de-spalat-vase'];
const INQ = SUBS.map((s) => `'${s}'`).join(',');
const POS = `(lower(title) LIKE '%masina de spalat%' OR lower(title) LIKE '%mașină de spălat%' OR lower(title) LIKE '%masină de spalat%')`;
const NOT_WORDS = ['accesori', 'furtun', 'filtru', 'garnitura', 'garnitură', 'curea', 'motor', 'pompa', 'pompă', 'balama', 'rulment', 'amortizor', 'contragreutate', 'rezistenta', 'rezistență', 'programator', 'maner', 'mâner', 'hublou', 'suport', 'picioare', 'piedestal', 'anticalcar', 'detergent', 'balsam', 'tablete', 'capsule', 'odorizant', 'decalcifiant', 'protectie', 'protecție', 'husa', 'folie', 'montaj', 'instalare', 'piesa', 'piese', 'set ', 'kit ', 'jucarie', 'jucărie', 'aspirator', 'conector', 'adaptor', 'masa de calcat', 'masă de calcat', 'uscator de rufe', 'uscator rufe', 'uscător de rufe'];
const NOT_SQL = NOT_WORDS.map((w) => `lower(title) NOT LIKE '%${w}%'`).join(' AND ');
const BRAND_BLOCK = ['leifheit', 'lamart', 'vileda', 'gimi', 'brabantia', 'rorets', 'roller'];
const BRAND_SQL = BRAND_BLOCK.map((b) => `lower(coalesce(brand,'')) <> '${b}'`).join(' AND ');
const rows = db.prepare(`SELECT id, slug, title, price, oldPrice, brand, brandSlug, merchant, merchantSlug, img, descr
  FROM products WHERE (megaSlug='electronice-it' OR megaSlug='casa-gradina') AND subSlug IN (${INQ}) AND ${POS} AND ${NOT_SQL} AND ${BRAND_SQL}
  AND img IS NOT NULL AND img <> '' AND price >= 300 AND price <= 2000 ORDER BY price DESC`).all();

// ---- helpers ----
const esc = (s) => String(s || '');
const money = (n) => Number(n).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' lei';
const sl = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 70).replace(/^-+|-+$/g, '');
const seedOf = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const strip = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
const COLORS = ['alb', 'alba', 'inox', 'silver', 'argintiu', 'argintie', 'negru', 'neagra', 'gri', 'grafit', 'antracit', 'crem', 'white', 'black', 'silver'];
const M_NAMES = { evomag: 'evoMAG', dwyn: 'Dwyn', ozone: 'Ozone', flanco: 'Flanco', vonmag: 'Vonmag', flip: 'Flip', bsgmag: 'BSGmag' };
const merchSlugOf = (m) => (m || '').replace(/\/+$/, '').split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'magazin';

function imgUrl(poolImg, name) {
  const m = /([0-9a-f]{16})\.webp$/.exec(poolImg || '');
  if (!m) return '';
  return `${IMG_HOST}/${sl(name).slice(0, 55).replace(/-+$/, '')}-${m[1]}.webp`;
}

function parseSpecs(t, descr, brand) {
  const s = t + ' ' + (descr || ''); const ls = s.toLowerCase();
  const kind = /spalat vase|spălat vase|de vase/i.test(s) ? 'vase' : 'rufe';
  let capacity = null, capUnit = '';
  if (kind === 'vase') { const m = s.match(/(\d{1,2})\s*(?:seturi|set)\b/i); if (m) { capacity = +m[1]; capUnit = 'seturi'; } }
  else { const m = s.match(/(\d{1,2}(?:[.,]\d)?)\s*kg\b/i); if (m) { capacity = parseFloat(m[1].replace(',', '.')); capUnit = 'kg'; } }
  const spin = (s.match(/(\d{3,4})\s*(?:rotatii|rotații|rpm|rot\/min|rot\.|r\/min|r\b)/i) || [])[1];
  const energyClass = (s.match(/clasa\s*([A-G]\+{0,3})/i) || s.match(/\b([A-G]\+{2,3})\b/) || [])[1] || '';
  let type = kind === 'vase' ? 'Mașină de spălat vase' : 'Mașină de spălat rufe';
  if (kind === 'rufe') {
    if (/semiautomat|semi-automat|semi automat/i.test(s)) type = 'Semiautomată';
    else if (/cu uscator|cu uscător|si uscat|și uscat/i.test(s)) type = 'Cu uscător';
    else if (/incarcare verticala|încărcare verticală|verticala|top.?load/i.test(s)) type = 'Încărcare verticală';
    else if (/slim/i.test(s)) type = 'Frontală slim';
    else type = 'Frontală';
  } else if (/incorporabil|încorporabil|integrabil/i.test(s)) type = 'Vase încorporabilă';
  let color = ''; const ss = strip(t);
  for (const c of COLORS) { if (new RegExp('\\b' + c + '\\b').test(ss)) { color = c; break; } }
  return { brand: brand || '', kind, capacity, capUnit, spin: spin ? +spin : null, energyClass: energyClass ? energyClass.toUpperCase() : '', type, color };
}

function modelKey(title, brandSlug, sp) {
  let core = strip(title).split(',')[0]
    .replace(/\b(masina de spalat|masină de spalat|rufe|vase|frontala|verticala|semiautomata|cu uscator|slim|incorporabila|kg|seturi|set|clasa [a-g+]+|\d{3,4} ?(rotatii|rpm|r))\b/g, ' ');
  for (const c of COLORS) core = core.replace(new RegExp('\\b' + c + '\\b', 'g'), ' ');
  if (brandSlug) core = core.replace(new RegExp('\\b' + brandSlug.replace(/-/g, ' ') + '\\b', 'g'), ' ');
  core = core.replace(/[^a-z0-9]+/g, '');
  return `${brandSlug || 'x'}|${core}|${sp.capacity || 0}|${sp.color}|${sp.kind}`;
}

const BAND_LABELS = { rufe: 'Mașini de spălat rufe', vase: 'Mașini de spălat vase' };
const VALUE_BRANDS = new Set(['candy', 'samus', 'albatros', 'heinner', 'arctic', 'beko', 'nobeltek', 'ravanson', 'albalux', 'star-light', 'ldk']);

function genProse(p, sp, offerCount) {
  const r = rng(seedOf(p.slug));
  const b = sp.brand || 'acest producător';
  const price = money(p.price);
  const m = esc(p.merchant).replace(/\/+$/, '');
  const reduced = p.oldPrice > p.price;
  const noun = sp.kind === 'vase' ? 'mașină de spălat vase' : 'mașină de spălat rufe';
  const capTxt = sp.capacity ? `${sp.capacity} ${sp.capUnit}` : (sp.kind === 'vase' ? 'o capacitate potrivită' : 'o capacitate potrivită');
  const useCase = sp.kind === 'vase'
    ? (sp.capacity ? (sp.capacity <= 9 ? 'potrivită pentru 1-2 persoane sau o bucătărie mică' : sp.capacity <= 12 ? 'bună pentru o familie de 3-4 persoane' : 'încăpătoare pentru o familie numeroasă') : 'potrivită pentru utilizare zilnică')
    : (sp.capacity ? (sp.capacity <= 4 ? 'ideală pentru o persoană, garsonieră sau cămin' : sp.capacity <= 6 ? 'potrivită pentru 1-2 persoane' : sp.capacity <= 7 ? 'bună pentru o familie mică' : 'încăpătoare pentru o familie de 3-4 persoane') : 'potrivită pentru utilizare zilnică');
  const energyTxt = sp.energyClass ? `clasă energetică ${sp.energyClass}` : 'consum echilibrat';
  const spinTxt = sp.spin ? `, centrifugare la ${sp.spin} rotații/min` : '';
  const opener = pick(r, [
    `${esc(p.title)} este o ${noun} ieftină de la ${b}, disponibilă de la ${price}${reduced ? ` (redusă de la ${money(p.oldPrice)})` : ''}.`,
    `La ${price}${reduced ? `, sub prețul vechi de ${money(p.oldPrice)},` : ''} ${esc(p.title)} este oferta ${b} pe care o urmărim în segmentul accesibil.`,
    `Cauți o ${noun} ieftină și bună? ${esc(p.title)} de la ${b} pornește de la ${price}.`,
  ]);
  const specSent = pick(r, [
    `Are ${capTxt} și ${energyTxt}${spinTxt}${sp.color ? `, finisaj ${sp.color}` : ''}.`,
    `Vine cu ${capTxt}, ${energyTxt}${spinTxt}${sp.color ? `, culoare ${sp.color}` : ''}.`,
  ]);
  const offerSent = offerCount > 1 ? ` O găsești la ${offerCount} magazine — mai jos îți arătăm fiecare ofertă, de la cea mai mică.` : ` Disponibilă prin ${m}.`;
  const intro = `${opener} ${specSent} Cu ${capTxt}, este ${useCase}.${offerSent}`;
  const guide = [
    sp.kind === 'vase'
      ? `${sp.capacity ? `Capacitatea de ${sp.capacity} seturi o face ${useCase}.` : 'Alege numărul de seturi în funcție de câte persoane sunt în casă.'} ${sp.energyClass ? `Clasa ${sp.energyClass} ajută la un consum decent de apă și curent.` : 'Verifică consumul de apă pe ciclu — contează pe termen lung.'}`
      : `${sp.capacity ? `Capacitatea de ${sp.capacity} kg o face ${useCase}.` : 'Alege capacitatea (kg) în funcție de câte persoane sunt în casă.'} ${sp.spin ? `Centrifugarea la ${sp.spin} rotații/min scoate rufele mai uscate, deci se usucă mai repede.` : 'O centrifugare mai mare (1000-1400 rpm) scoate rufele mai uscate.'}`,
    `${sp.energyClass ? `Clasa energetică ${sp.energyClass} înseamnă un consum rezonabil pe an la un aparat folosit des.` : 'La un aparat folosit des, clasa energetică contează pe termen lung.'} La modelele ieftine, verifică nivelul de zgomot și programele disponibile.`,
  ];
  const faq = [
    { q: `Cât costă ${esc(p.title)}?`, a: `${esc(p.title)} pornește de la ${price}${reduced ? ` (redusă de la ${money(p.oldPrice)})` : ''}.${offerCount > 1 ? ` Este listată la ${offerCount} magazine; afișăm fiecare ofertă.` : ''} Prețurile sunt actualizate periodic.` },
    ...(sp.capacity ? [{ q: `Ce capacitate are?`, a: `Are ${capTxt}, ${useCase}.` }] : []),
    ...(sp.energyClass ? [{ q: `Ce clasă energetică are?`, a: `Are ${energyTxt}.` }] : []),
    ...(sp.kind === 'rufe' && sp.spin ? [{ q: `Ce viteză de centrifugare are?`, a: `Centrifughează la ${sp.spin} rotații/min.` }] : []),
    { q: `De unde o pot cumpăra?`, a: `Prin ${SITE_NAME} — îți arătăm ${offerCount > 1 ? 'toate ofertele și' : ''} prețul curent și te ducem direct la magazin.` },
  ];
  return { intro, guide, faq };
}

// ---- DEDUP: cheapest offer per merchant, per model identity ----
const winners = {};
for (const row of rows) {
  const img = imgUrl(row.img, row.title); if (!img) continue;
  const cu = (CAMPAIGN[row.merchantSlug] || {}).c; if (!cu) continue;
  const sp = parseSpecs(row.title, row.descr, row.brand);
  const mkey = modelKey(row.title, row.brandSlug, sp);
  const mSlug = merchSlugOf(row.merchant);
  const offer = { mSlug, mName: M_NAMES[mSlug] || cap(mSlug), price: row.price, oldPrice: row.oldPrice > row.price ? row.oldPrice : null, affiliate: `https://event.2performant.com/events/click?ad_type=product_store&aff_code=${AFF}&unique=${encodeURIComponent(row.id)}&campaign_unique=${cu}`, row, sp, img };
  const w = winners[mkey] || (winners[mkey] = { byMerchant: {} });
  const cur = w.byMerchant[mSlug];
  if (!cur || offer.price < cur.price) w.byMerchant[mSlug] = offer;
}

const LEDGER = fileURLToPath(new URL('../.cache/modified-ledger.json', import.meta.url));
const oldLedger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {};
const newLedger = {};
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const seen = new Set();
const products = [];
for (const [mkey, w] of Object.entries(winners)) {
  const offers = Object.values(w.byMerchant).sort((a, b) => a.price - b.price).slice(0, 6);
  const best = offers[0];
  const { row, sp, img } = best;
  const name = row.title.trim();
  let slug = oldLedger[mkey] && oldLedger[mkey].s;
  if (!slug) { slug = (sl(name).slice(0, 55).replace(/-+$/, '') || 'masina') + '-' + seedOf(mkey).toString(36); if (seen.has(slug)) { let k = 2; while (seen.has(slug + '-' + k)) k++; slug += '-' + k; } }
  seen.add(slug);
  const offerCount = offers.length;
  const prose = genProse({ title: name, slug, price: best.price, oldPrice: best.oldPrice || 0, merchant: best.row.merchant }, sp, offerCount);
  const brandSlug = row.brandSlug || (sp.brand ? sl(sp.brand) : '');
  const offerList = offers.map((o, i) => ({ merchantSlug: o.mSlug, merchantName: o.mName, price: o.price, oldPrice: o.oldPrice, affiliate: o.affiliate, outKey: i === 0 ? slug : `${slug}~${o.mSlug}` }));
  const chash = seedOf(`${best.price}|${best.oldPrice}|${name}|${img}|${JSON.stringify(sp)}|${offers.map((o) => o.mSlug + o.price).join()}`);
  const modified = (oldLedger[mkey] && oldLedger[mkey].h === chash) ? oldLedger[mkey].m : BUILD_DATE;
  newLedger[mkey] = { h: chash, m: modified, s: slug, b: brandSlug, z: sp.kind, d: BUILD_DATE };
  products.push({
    slug, id: row.id, name, brand: sp.brand, brandSlug, price: best.price, oldPrice: best.oldPrice,
    merchant: best.row.merchant, merchantSlug: best.mSlug, merchantName: best.mName, img, affiliate: best.affiliate, modified, band: sp.kind, bandLabel: BAND_LABELS[sp.kind], kind: sp.kind, type: sp.type, offerCount,
    offers: offerList,
    specs: { Brand: sp.brand || '—', Tip: sp.type, ...(sp.capacity ? { Capacitate: `${sp.capacity} ${sp.capUnit}` } : {}), ...(sp.spin ? { Centrifugare: `${sp.spin} rot/min` } : {}), ...(sp.energyClass ? { 'Clasă energetică': sp.energyClass } : {}), ...(sp.color ? { Culoare: cap(sp.color) } : {}) },
    prose,
  });
}

// dropped -> 301 similar
const RETAIN_DAYS = 150;
const cutoff = new Date(new Date(BUILD_DATE + 'T00:00:00Z').getTime() - RETAIN_DAYS * 864e5).toISOString().slice(0, 10);
const byBrandBand = {};
for (const p of products) (byBrandBand[`${p.brandSlug}|${p.band}`] ||= []).push(p);
const brandPages = new Set();
{ const bc = {}; for (const p of products) if (p.brandSlug) bc[p.brandSlug] = (bc[p.brandSlug] || 0) + 1; for (const b in bc) if (bc[b] >= 4) brandPages.add(b); }
const dropped = {};
for (const mkey of Object.keys(oldLedger)) {
  if (newLedger[mkey]) continue;
  const e = oldLedger[mkey]; if (!e || !e.s) continue;
  if ((e.d || '0') < cutoff) continue;
  const sim = byBrandBand[`${e.b}|${e.z}`];
  dropped[e.s] = (sim && sim.length) ? `/masina/${sim[0].slug}/` : (brandPages.has(e.b) ? `/brand/${e.b}/` : '/recomandari/');
  newLedger[mkey] = e;
}

mkdirSync(fileURLToPath(new URL('../src/data', import.meta.url)), { recursive: true });
writeFileSync(OUT, JSON.stringify(products));
mkdirSync(fileURLToPath(new URL('../.cache', import.meta.url)), { recursive: true });
writeFileSync(LEDGER, JSON.stringify(newLedger));
writeFileSync(fileURLToPath(new URL('../.cache/dropped.json', import.meta.url)), JSON.stringify(dropped));
const multi = products.filter((p) => p.offerCount > 1).length;
const kinds = {}; for (const p of products) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
console.log(`  ${rows.length} offers -> ${products.length} distinct machines (${multi} multi-merchant); kinds ${JSON.stringify(kinds)}; ${Object.keys(dropped).length} dropped 301s`);
const brands = {}; for (const p of products) brands[p.brand] = (brands[p.brand] || 0) + 1;
console.log('  top brands:', Object.entries(brands).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(', '));
