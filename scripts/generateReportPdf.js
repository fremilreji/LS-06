const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/₹/g, 'Rs. ')
    .replace(/[—–]/g, ' - ')
    .replace(/’/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/•/g, '* ')
    .replace(/ಆಮೇಲೆ ನೋಡೋಣ/g, 'Amele nodona (we will see later)')
    .replace(/ಕಟ್ ಮಾಡ್ತೀನಿ/g, 'Cut madtini (will deduct debit note)')
    .replace(/ಎಕ್ಸ್ಟ್ರಾ/g, 'Extra work')
    .replace(/ಆರ್ಡರ್ ಚೀಟಿ/g, 'Order Cheeti')
    .replace(/ऑर्डर पर्ची/g, 'Order Parchi')
    .replace(/[^\x00-\x7F]/g, ''); // strip any remaining non-ASCII bytes
}

function generatePdf() {
  const mdPath = path.join(__dirname, '..', 'PROJECT_REPORT_LS06.md');
  const outPath = path.join(__dirname, '..', 'PROJECT_REPORT_LS06.pdf');
  const rawContent = fs.readFileSync(mdPath, 'utf8');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = margin;

  function checkPageBreak(neededHeight) {
    if (cursorY + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      cursorY = margin + 8;
      // Header on subsequent pages
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('DealProof AI (PactProof / Jan-Karar) - Project Report (LS-06) | Team Redhounds', margin, margin);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
    }
  }

  // Load screenshots
  const screenshotDir = path.join(__dirname, '..', 'public', 'screenshots');
  const step1Path = path.join(screenshotDir, 'step1_mobile_ingestion.png');
  const step2Path = path.join(screenshotDir, 'step2_gap_analysis.png');
  const step3Path = path.join(screenshotDir, 'step3_order_slip.png');
  const step4Path = path.join(screenshotDir, 'step4_remote_buyer_assent.jpg');

  const lines = rawContent.split('\n');
  let inCodeBlock = false;
  let codeBlockLines = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].replace(/\r$/, '');
    const cleanLine = sanitizeText(rawLine);
    const trimmed = cleanLine.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Render accumulated code block
        inCodeBlock = false;
        checkPageBreak(codeBlockLines.length * 3.8 + 6);
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(220, 225, 230);
        const boxHeight = codeBlockLines.length * 3.8 + 4;
        doc.roundedRect(margin, cursorY, maxLineWidth, boxHeight, 2, 2, 'FD');
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(40, 45, 55);
        let blockY = cursorY + 3.5;
        codeBlockLines.forEach(cl => {
          doc.text(cl.slice(0, 85), margin + 3, blockY);
          blockY += 3.8;
        });
        cursorY += boxHeight + 4;
        codeBlockLines = [];
      } else {
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(cleanLine);
      continue;
    }

    if (!trimmed) {
      cursorY += 2.5;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(24, 24, 27);
      const text = trimmed.substring(2);
      const wrapped = doc.splitTextToSize(text, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 8 + 2;
    } else if (trimmed.startsWith('## ')) {
      checkPageBreak(14);
      cursorY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(194, 65, 12); // Terracotta accent
      const text = trimmed.substring(3);
      const wrapped = doc.splitTextToSize(text, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 6 + 1.5;
      doc.setDrawColor(225, 225, 230);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 3.5;

      // When reaching Section 10: User Interface & Demonstration, embed screenshots!
      if (text.includes('10. User Interface') || text.includes('Demonstration')) {
        checkPageBreak(120);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 30, 30);
        doc.text('Figure 1: Step 1 (Mobile Chat & Speech Ingestion) and Step 2 (Statutory Gap Analysis)', margin, cursorY);
        cursorY += 5;

        // Embed Step 1 & Step 2 side by side
        if (fs.existsSync(step1Path) && fs.existsSync(step2Path)) {
          const b1 = 'data:image/png;base64,' + fs.readFileSync(step1Path).toString('base64');
          const b2 = 'data:image/png;base64,' + fs.readFileSync(step2Path).toString('base64');
          doc.addImage(b1, 'PNG', margin, cursorY, 55, 110);
          doc.addImage(b2, 'PNG', margin + 60, cursorY, 120, 110);
          cursorY += 115;
        }

        checkPageBreak(125);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 30, 30);
        doc.text('Figure 2: Step 3 (Verified Order Slip) and Step 4 (Remote Mobile Buyer Assent)', margin, cursorY);
        cursorY += 5;

        // Embed Step 3 & Step 4
        if (fs.existsSync(step3Path) && fs.existsSync(step4Path)) {
          const b3 = 'data:image/png;base64,' + fs.readFileSync(step3Path).toString('base64');
          const b4 = 'data:image/jpeg;base64,' + fs.readFileSync(step4Path).toString('base64');
          doc.addImage(b3, 'PNG', margin, cursorY, 120, 110);
          doc.addImage(b4, 'JPEG', margin + 125, cursorY, 55, 110);
          cursorY += 115;
        }
      }

    } else if (trimmed.startsWith('### ')) {
      checkPageBreak(10);
      cursorY += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(39, 39, 42);
      const text = trimmed.substring(4);
      const wrapped = doc.splitTextToSize(text, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 5 + 1;
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(45, 45, 45);
      const cleanBullet = trimmed.substring(2).replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize('•  ' + cleanBullet, maxLineWidth - 4);
      doc.text(wrapped, margin + 2, cursorY);
      cursorY += wrapped.length * 4.3 + 1;
    } else if (trimmed.startsWith('|')) {
      if (trimmed.includes('---')) continue; // Skip separator line
      checkPageBreak(8);
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      const cellText = cells.join('  |  ').replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(cellText, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 4.2 + 1.5;
    } else {
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(55, 55, 55);
      const cleanText = trimmed.replace(/\*\*/g, '').replace(/_([^_]+)_/g, '$1');
      const wrapped = doc.splitTextToSize(cleanText, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 4.2 + 1;
    }
  }

  // Add clean page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 22, pageHeight - 8);
  }

  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outPath, Buffer.from(pdfBytes));
  console.log(`PDF successfully generated with screenshots at: ${outPath} (${totalPages} pages)`);
}

generatePdf();
