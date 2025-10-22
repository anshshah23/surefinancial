import fs from 'fs';
import path from 'path';
import { parseStatement, parsePdf } from './parser.mjs';
import { PDFDocument } from 'pdf-lib';

const samplesDir = path.resolve('./src/parser/sample-statements');
const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.txt'));

let passed = 0;
let failed = 0;

async function textToPdfBuffer(text) {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  page.drawText(text, { x: 20, y: height - 40, size: fontSize });
  return await doc.save();
}

(async () => {
  for (const f of files) {
    const text = fs.readFileSync(path.join(samplesDir, f), 'utf8');

    // First, test text parsing
    const resText = parseStatement(text);
    console.log('--- TEXT:', f);
    console.log(JSON.stringify(resText, null, 2));

    // Then, create a simple PDF and test PDF parsing
    const pdfBuf = await textToPdfBuffer(text);
    const resPdf = await parsePdf(pdfBuf);
    console.log('--- PDF:', f.replace('.txt', '.pdf'));
    console.log(JSON.stringify(resPdf, null, 2));

    // Determine pass if issuer or last4 or total_balance was found in PDF parse
    const checks = [resPdf.issuer, resPdf.card_last4, resPdf.billing_cycle, resPdf.payment_due_date, resPdf.total_balance];
    const ok = checks.some(v => v !== null);
    if (ok) passed++; else failed++;
  }

  console.log(`\nResult: passed=${passed} failed=${failed}`);
  process.exit(failed > 0 ? 1 : 0);
})();
