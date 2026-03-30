import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT_DIR = fileURLToPath(new URL('../public/assets/images/products', import.meta.url));
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const products = [
  { slug: 'arctic-aplm1wfsu17210w', url: 'https://www.emag.ro/masina-de-spalat-rufe-arctic-7-kg-1200-rpm-clasa-energetica-a-motor-silent-inverter-extrasteam-ironexpress-recycled-tub-fast-intensive-steam-watermode-water-saving-extra-rinse-prewash-child-lock-add-i/pd/DL6C1VYBM/' },
  { slug: 'heinner-hwm-h7014ivsmtc', url: 'https://www.emag.ro/masina-de-spalat-rufe-slim-heinner-7-kg-1400-rpm-clasa-c-motor-inverter-display-digital-blocare-acces-copii-gri-hwm-h7014ivsmtc/pd/DYRPLMYBM/' },
  { slug: 'daewoo-dwd-fv2021', url: 'https://www.emag.ro/masina-de-spalat-rufe-daewoo-7-kg-1000-rpm-display-clasa-d-alb-dwd-fv2021/pd/DVH5X3BBM/' },
  { slug: 'tcl-ff0612sb1', url: 'https://www.emag.ro/masina-de-spalat-rufe-tcl-6-kg-1200-rpm-clasa-b-bldc-inverter-motor-steam-wash-drum-clean-24-hour-delay-honeycomb-drum-quick-wash-18-min-add-garment-16-programe-argintiu-ff0612sb1/pd/DCBQ3CYBM/' },
  { slug: 'beko-bm3wfu37013ww', url: 'https://www.emag.ro/masina-de-spalat-rufe-beko-energyspin-steamcure-7-kg-1000rpm-clasa-a-alb-bm3wfu37013ww/pd/DW51653BM/' },
  { slug: 'arctic-aplm2wfsu28211w', url: 'https://www.emag.ro/masina-de-spalat-rufe-arctic-8-kg-1200-rpm-clasa-a-motor-silent-inverter-extrasteam-ironexpress-recycled-tub-fast-intensive-steam-watermode-child-lock-add-in-alb-aplm2wfsu28211w/pd/D0BLWFYBM/' },
  { slug: 'vision-clean-vms71215d', url: 'https://www.emag.ro/masina-de-spalat-rufe-vision-clean-vms71215d-1200-rpm-7-kg-15-programe-functie-start-intarziat-allergy-safe-clasa-d-235580/pd/DPMQSSYBM/' },
  { slug: 'heinner-hwm-m814ivsmna', url: 'https://www.emag.ro/masina-de-spalat-rufe-slim-heinner-8-kg-1400-rpm-clasa-a-motor-inverter-display-digital-blocare-acces-copii-alb-hwm-m814ivsmna/pd/DLGFKBYBM/' },
  { slug: 'beko-bm3wfsu47415wb', url: 'https://www.emag.ro/masina-de-spalat-rufe-beko-7-kg-1400-rpm-clasa-a-motor-prosmart-inverter-steamcure-addxtra-energyspin-coldwash-alb-bm3wfsu47415wb/pd/DG88TPYBM/' },
  { slug: 'arctic-arsma862wro', url: 'https://www.emag.ro/masina-de-spalat-rufe-arctic-arsma862wro-8-kg-1200-rpm-clasa-a-15-programe-digital-display-child-lock-alb-273935/pd/DXC6XB2BM/' },
  { slug: 'beko-b5dft510442m', url: 'https://www.emag.ro/masina-de-spalat-rufe-cu-uscator-beko-10-kg-spalare-6-kg-uscare-clasa-a-1400-rpm-motor-prosmart-inverter-homewhiz-steamcure-ultrafast-addxtra-gri-b5dft510442m/pd/DN3S3DYBM/' },
  { slug: 'whirlpool-freshcare-ffb8258bvee', url: 'https://www.emag.ro/masina-de-spalat-rufe-whirlpool-freshcare-8-kg-1200-rpm-clasa-b-steam-refresh-tehnologia-al-6lea-simt-motor-inverter-alb-ffb8258bvee/pd/D16FQHMBM/' },
  { slug: 'samsung-ww60a3120we-le', url: 'https://www.emag.ro/masina-de-spalat-rufe-slim-samsung-6-kg-1200-rpm-clasa-c-hygiene-steam-quick-wash-15-min-alb-ww60a3120we-le/pd/D09GZSYBM/' },
  { slug: 'tcl-ff0912wa0', url: 'https://www.emag.ro/masina-de-spalat-rufe-tcl-9-kg-1200-rpm-clasa-a-motor-inverter-steam-wash-drum-clean-honeycomb-drum-alb-ff0912wa0/pd/DTMHTFYBM/' },
  { slug: 'miele-wwg660-wcs', url: 'https://www.emag.ro/masina-de-spalat-rufe-miele-wwg660-wcs-clasa-a-9-kg-1400-rpm-twindos-capdosing-alb-wwg660wcs-eu1-lw-tdos-9kg/pd/D2ZGD1MBM/' },
  { slug: 'bosch-seria-8-wgb24400by', url: 'https://www.emag.ro/masina-de-spalat-rufe-bosch-seria-8-9-kg-1400-rpm-ecosilence-drive-home-connect-iron-assist-iluminare-interioara-clasa-a-60-cm-alb-wgb24400by/pd/D2VSC8MBM/' },
  { slug: 'lg-f4j3tm5we', url: 'https://www.emag.ro/masina-de-spalat-rufe-cu-uscator-lg-8-kg-spalare-5-kg-uscare-1400-rpm-clasa-d-direct-drive-smartdiagnosis-alb-f4j3tm5we/pd/D3YYW0MBM/' },
  { slug: 'electrolux-perfectcare800-ew8w261bg', url: 'https://www.emag.ro/masina-de-spalat-rufe-cu-uscator-electrolux-perfectcare800-10-6-kg-1600-rpm-clase-a-d-motor-inverter-ultracare-steamcare-abur-freshscent-onego-1-kg-1h-spalare-uscare-ultrawash-dry-59-adancime-totala-6/pd/DG3H8W3BM/' },
  { slug: 'aeg-lwr73166oe', url: 'https://www.emag.ro/masina-de-spalat-rufe-cu-uscator-aeg-spalare-10-kg-uscare-6-kg-1600-rpm-clase-a-conectivitate-wi-fi-prin-aplicatia-myaeg-care-motor-inverter-cu-magnetpermanent-prosense-prosteam-time-save-aquacontrol-/pd/DTW27MYBM/' },
  { slug: 'samsung-wd18db8995bzt2', url: 'https://www.emag.ro/masina-de-spalat-rufe-cu-uscator-samsung-spalare-18-kg-uscare-11-kg-1000-rpm-clasa-a-ai-home-7-display-ai-wash-dry-ai-ecobubble-super-speed-98-min-digital-inverter-motor-negru-wd18db8995bzt2/pd/DBH2M23BM/' },
  { slug: 'roborock-zeo-one-r600001', url: 'https://www.emag.ro/masina-de-spalat-rufe-cu-uscator-roborock-zeo-one-spalare-10-kg-uscare-6-kg-1400-rpm-wi-fi-auto-dose-fast-dry-touch-control-27-programe-clasa-a-alb-r600001/pd/DX5P4PYBM/' },
];

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function getImageUrl(pageUrl) {
  const res = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
    },
  });
  const html = await res.text();

  // Try og:image first
  const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/);
  if (ogMatch) return ogMatch[1];

  // Try product image from gallery
  const imgMatch = html.match(/https:\/\/[^"]*\.emag\.(ro|io)\/products\/[^"]+\.(jpg|jpeg|png|webp)/i);
  if (imgMatch) return imgMatch[0];

  return null;
}

async function downloadImage(url, slug) {
  const outPath = `${OUT_DIR}/${slug}.webp`;
  if (existsSync(outPath)) {
    console.log(`  SKIP ${slug} (exists)`);
    return true;
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    // Convert to webp using sharp
    const sharp = (await import('sharp')).default;
    await sharp(buffer)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  OK ${slug}`);
    return true;
  } catch (e) {
    console.log(`  FAIL ${slug}: ${e.message}`);
    return false;
  }
}

console.log(`Downloading ${products.length} product images...\n`);

for (const p of products) {
  console.log(`${p.slug}:`);
  const imgUrl = await getImageUrl(p.url);
  if (imgUrl) {
    await downloadImage(imgUrl, p.slug);
  } else {
    console.log(`  NO IMAGE FOUND`);
  }
  // Random delay 2-5 seconds between requests
  const wait = 2000 + Math.random() * 3000;
  await delay(wait);
}

console.log('\nDone!');
