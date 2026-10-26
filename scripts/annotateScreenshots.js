const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Helper to create an SVG pin with a badge and label
function createPin(x, y, label, rawText, width, align = 'right') {
  const text = escapeXml(rawText);
  const pinRadius = 13;
  const pillHeight = 24;
  const pillPadding = 10;
  const textLen = rawText.length * 6.8;
  const pillWidth = textLen + pillPadding * 2 + pinRadius * 2;
  
  let pillX = x + pinRadius + 4;
  if (align === 'left') {
    pillX = x - pillWidth - 4;
  } else if (align === 'center') {
    pillX = x - pillWidth / 2;
  }
  
  // Boundary check
  if (pillX + pillWidth > width - 10) {
    pillX = width - pillWidth - 10;
  }
  if (pillX < 10) pillX = 10;

  return `
    <g filter="url(#shadow)">
      <!-- Target indicator ring -->
      <circle cx="${x}" cy="${y}" r="${pinRadius + 4}" fill="#DC2626" fill-opacity="0.25" />
      <circle cx="${x}" cy="${y}" r="${pinRadius}" fill="#DC2626" stroke="#FFFFFF" stroke-width="2" />
      <text x="${x}" y="${y + 4.5}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">${label}</text>
      
      <!-- Label pill -->
      <rect x="${pillX}" y="${y - pillHeight / 2}" width="${pillWidth}" height="${pillHeight}" rx="6" fill="#0F172A" fill-opacity="0.94" stroke="#DC2626" stroke-width="1.5" />
      <text x="${pillX + pinRadius + 4}" y="${y + 4}" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="bold" fill="#F8FAFC">${text}</text>
    </g>
  `;
}

// Helper to create a bounding highlight box
function createBox(x, y, w, h, stroke = '#DC2626') {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#DC2626" fill-opacity="0.08" stroke="${stroke}" stroke-width="2" stroke-dasharray="6,4" />
  `;
}

async function annotateStep1() {
  const file = path.join(__dirname, '../public/screenshots/step1_mobile_ingestion.png');
  const outFile = path.join(__dirname, '../public/screenshots/step1_annotated.png');
  const meta = await sharp(file).metadata();
  const w = meta.width;
  const h = meta.height;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6" />
        </filter>
      </defs>
      ${createBox(20, 110, w - 40, 115)}
      ${createPin(35, 125, 'A', 'Step 1A: Udyam / MSME Check (Silpi Rule)', w, 'right')}

      ${createBox(20, 240, w - 40, 115)}
      ${createPin(35, 255, 'B', 'Step 1B: On-Device Voice Recording (Web Speech)', w, 'right')}

      ${createBox(20, 375, w - 40, 280)}
      ${createPin(35, 395, 'C', 'WhatsApp Chat Ingestion & Real-World Presets', w, 'right')}
    </svg>
  `;

  await sharp(file)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(outFile);
  console.log('Annotated step1 generated:', outFile);
}

async function annotateStep2() {
  const file = path.join(__dirname, '../public/screenshots/step2_gap_analysis.png');
  const outFile = path.join(__dirname, '../public/screenshots/step2_annotated.png');
  const meta = await sharp(file).metadata();
  const w = meta.width;
  const h = meta.height;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6" />
        </filter>
      </defs>
      ${createBox(20, 65, w - 40, 125)}
      ${createPin(35, 80, 'D', '5-Pillar Extraction State (Buyer, Supplier, Qty, Rate, Timeline)', w, 'right')}

      ${createBox(20, 200, w - 40, 75)}
      ${createPin(35, 215, 'E', '100% Deterministic Math (1,500 x Rs 58 = Rs 87,000)', w, 'right')}

      ${createBox(20, 285, w - 40, 140)}
      ${createPin(35, 300, 'F', 'Statutory Gap Triage & In-Place Clause Editor', w, 'right')}
    </svg>
  `;

  await sharp(file)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(outFile);
  console.log('Annotated step2 generated:', outFile);
}

async function annotateStep3() {
  const file = path.join(__dirname, '../public/screenshots/step3_order_slip.png');
  const outFile = path.join(__dirname, '../public/screenshots/step3_annotated.png');
  const meta = await sharp(file).metadata();
  const w = meta.width;
  const h = meta.height;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6" />
        </filter>
      </defs>
      ${createBox(20, 45, w - 40, 125)}
      ${createPin(35, 60, 'A', 'Clean 2-Page Printable Order Memorandum (@media print)', w, 'right')}

      ${createBox(20, 180, w - 40, 135)}
      ${createPin(35, 195, 'B', 'Statutory Clauses (ICA Sec 150 Bailment & SOGA Sec 42)', w, 'right')}

      ${createBox(20, 325, w - 40, 105)}
      ${createPin(35, 340, 'C', 'Section 63 BSA Digital Certificate & Canonical SHA-256', w, 'right')}

      ${createBox(20, 440, w - 40, 95)}
      ${createPin(35, 455, 'D', 'Karnataka Stamp Act Art. 5(i-d) Notice & In Re: Interplay', w, 'right')}
    </svg>
  `;

  await sharp(file)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(outFile);
  console.log('Annotated step3 generated:', outFile);
}

async function annotateStep4() {
  const file = path.join(__dirname, '../public/screenshots/step4_remote_buyer_assent.jpg');
  const outFile = path.join(__dirname, '../public/screenshots/step4_annotated.jpg');
  const meta = await sharp(file).metadata();
  const w = meta.width;
  const h = meta.height;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6" />
        </filter>
      </defs>
      ${createBox(20, 90, w - 40, 220)}
      ${createPin(35, 105, 'E', 'Remote WhatsApp Link (wa.me) & Independent Portal (/deal/[id])', w, 'right')}

      ${createBox(20, 465, w - 40, 320)}
      ${createPin(35, 480, 'F', 'Bilateral Mobile Assent & Touch Signature Pad (Sec 10A IT Act)', w, 'right')}
    </svg>
  `;

  await sharp(file)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(outFile);
  console.log('Annotated step4 generated:', outFile);
}

// Generate unified Figure 1 composite (Step 1 + Step 2)
async function generateFigure1Composite() {
  const s1Path = path.join(__dirname, '../public/screenshots/step1_annotated.png');
  const s2Path = path.join(__dirname, '../public/screenshots/step2_annotated.png');
  const outFile = path.join(__dirname, '../public/screenshots/figure1_annotated.png');

  const s1Buffer = await sharp(s1Path).resize({ height: 1024 }).toBuffer();
  const s2Buffer = await sharp(s2Path).resize({ height: 1024, fit: 'contain', background: '#F8FAFC' }).toBuffer();
  
  const m1 = await sharp(s1Buffer).metadata();
  const m2 = await sharp(s2Buffer).metadata();

  const gap = 20;
  const totalW = m1.width + gap + m2.width;
  const totalH = 1024;

  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: '#F1F5F9'
    }
  })
  .composite([
    { input: s1Buffer, top: 0, left: 0 },
    { input: s2Buffer, top: 0, left: m1.width + gap }
  ])
  .png()
  .toFile(outFile);
  console.log('Figure 1 composite generated:', outFile);
}

// Generate unified Figure 2 composite (Step 3 + Step 4)
async function generateFigure2Composite() {
  const s3Path = path.join(__dirname, '../public/screenshots/step3_annotated.png');
  const s4Path = path.join(__dirname, '../public/screenshots/step4_annotated.jpg');
  const outFile = path.join(__dirname, '../public/screenshots/figure2_annotated.png');

  const s3Buffer = await sharp(s3Path).resize({ height: 1024, fit: 'contain', background: '#F8FAFC' }).toBuffer();
  const s4Buffer = await sharp(s4Path).resize({ height: 1024 }).toBuffer();
  
  const m3 = await sharp(s3Buffer).metadata();
  const m4 = await sharp(s4Buffer).metadata();

  const gap = 20;
  const totalW = m3.width + gap + m4.width;
  const totalH = 1024;

  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: '#F1F5F9'
    }
  })
  .composite([
    { input: s3Buffer, top: 0, left: 0 },
    { input: s4Buffer, top: 0, left: m3.width + gap }
  ])
  .png()
  .toFile(outFile);
  console.log('Figure 2 composite generated:', outFile);
}

async function main() {
  await annotateStep1();
  await annotateStep2();
  await annotateStep3();
  await annotateStep4();
  await generateFigure1Composite();
  await generateFigure2Composite();
  console.log('All individual and composite annotated figures generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
