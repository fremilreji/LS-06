import { jsPDF } from 'jspdf';
import { AgreementDraft } from '@/types/agreement';
import { LEGAL_DISCLAIMER } from './generateDraft';

/**
 * Generates a clean, professional legal-tech PDF from an AgreementDraft
 * with automatic text wrapping, pagination, metadata header, status badge, and legal disclaimer.
 */
export function exportDraftToPdf(draft: AgreementDraft): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    // Subtle top border bar
    doc.setFillColor(15, 23, 42); // slate-900 / navy
    doc.rect(margin, currentY, contentWidth, 1.5, 'F');
    currentY += 6;
  };

  // 1. Initial Page Header
  drawHeader();

  // Application brand & Hackathon context
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Navy
  doc.text('DealProof AI', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('From Handshake to Contract | Informal Agreement Record', margin, currentY + 4.5);

  // Status Badge on the right
  const statusLabel = draft.status === 'PARTY_CONFIRMED'
    ? 'PARTY CONFIRMED'
    : draft.status === 'READY_FOR_PARTY_REVIEW'
    ? 'READY FOR REVIEW'
    : 'DRAFT - NEEDS REVIEW';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text(`STATUS: ${statusLabel}`, pageWidth - margin, currentY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Version: v${draft.version} | Generated: ${new Date(draft.updatedAt).toLocaleDateString()}`, pageWidth - margin, currentY + 4.5, { align: 'right' });

  currentY += 12;

  // Title of the Agreement
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(draft.title, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 6 + 4;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // Disclaimer Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(203, 213, 225); // Slate-300
  const disclaimerText = `LEGAL NOTICE: ${LEGAL_DISCLAIMER}`;
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  const boxHeight = disclaimerLines.length * 4.2 + 6;

  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(disclaimerLines, margin + 4, currentY + 5);
  currentY += boxHeight + 8;

  // Parties Summary Box
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Contracting Parties', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const pA = `Party 1 (${draft.extractedData.partyA.role}): ${draft.extractedData.partyA.name}`;
  const pB = `Party 2 (${draft.extractedData.partyB.role}): ${draft.extractedData.partyB.name}`;
  doc.text(pA, margin, currentY);
  currentY += 4.5;
  doc.text(pB, margin, currentY);
  currentY += 7;

  // Render Clauses
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Draft Agreement Terms & Conditions', margin, currentY);
  currentY += 6;

  for (const clause of draft.clauses) {
    checkPageBreak(25);

    // Clause Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const clauseHeader = `${clause.clauseNumber}. ${clause.title}`;
    doc.text(clauseHeader, margin, currentY);

    if (clause.needsConfirmation) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(220, 38, 38); // Red
      doc.text(' [NEEDS CONFIRMATION]', margin + doc.getTextWidth(clauseHeader) + 2, currentY);
    }
    currentY += 4.5;

    // Clause Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const bodyLines = doc.splitTextToSize(clause.body, contentWidth);
    for (const line of bodyLines) {
      checkPageBreak(5);
      doc.text(line, margin, currentY);
      currentY += 4.2;
    }

    // Supporting excerpt reference if any
    if (clause.supportingExcerpt) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const excerptLine = `Source Quote: "${clause.supportingExcerpt.trim()}"`;
      const splitExcerpt = doc.splitTextToSize(excerptLine, contentWidth);
      doc.text(splitExcerpt, margin, currentY);
      currentY += splitExcerpt.length * 3.8;
    }

    currentY += 4;
  }

  // Cryptographic Audit Footer
  checkPageBreak(25);
  currentY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Tamper-Evident Record & Integrity Metadata', margin, currentY);
  currentY += 4;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text(`SHA-256 Digest: ${draft.tamperEvidenceHash}`, margin, currentY);
  currentY += 4;
  doc.text(`Verification Timestamp: ${draft.createdAt} (Engine: ${draft.extractedData.engineUsed})`, margin, currentY);

  // Add page numbers at bottom of each page
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `DealProof AI | Digital Order Memorandum | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}
