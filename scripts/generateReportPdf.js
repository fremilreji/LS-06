const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generatePdf() {
  const mdPath = path.join(__dirname, '..', 'PROJECT_REPORT_LS06.md');
  const outPath = path.join(__dirname, '..', 'PROJECT_REPORT_LS06.pdf');
  const content = fs.readFileSync(mdPath, 'utf8');

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
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      // Header on subsequent pages
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('DealProof AI / PactProof — Project Report (LS-06) | Team Redhounds', margin, 8);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 10, pageWidth - margin, 10);
    }
  }

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].replace(/\r$/, '');
    const trimmed = rawLine.trim();

    if (!trimmed) {
      cursorY += 3;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(24, 24, 27);
      const text = trimmed.substring(2);
      const wrapped = doc.splitTextToSize(text, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 8 + 2;
    } else if (trimmed.startsWith('## ')) {
      checkPageBreak(12);
      cursorY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(194, 65, 12); // Terracotta accent
      const text = trimmed.substring(3);
      const wrapped = doc.splitTextToSize(text, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 6 + 2;
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, cursorY - 1, pageWidth - margin, cursorY - 1);
      cursorY += 2;
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
      checkPageBreak(7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      const cleanBullet = trimmed.substring(2).replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize('• ' + cleanBullet, maxLineWidth - 4);
      doc.text(wrapped, margin + 3, cursorY);
      cursorY += wrapped.length * 4.5 + 1;
    } else if (trimmed.startsWith('```')) {
      // Skip markdown code fence markers
      continue;
    } else if (trimmed.startsWith('|')) {
      // Tables: print as monospace text
      checkPageBreak(6);
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      const cleanRow = trimmed.replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(cleanRow, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 3.8 + 1;
    } else {
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const cleanText = trimmed.replace(/\*\*/g, '').replace(/_([^_]+)_/g, '$1');
      const wrapped = doc.splitTextToSize(cleanText, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 4.2 + 1;
    }
  }

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
  }

  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outPath, Buffer.from(pdfBytes));
  console.log(`PDF successfully generated at: ${outPath} (${totalPages} pages)`);
}

generatePdf();
