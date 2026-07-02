import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ScanResult, User } from '../types';

export const pdfService = {
  /**
   * Generate comprehensive medical report PDF
   */
  async generateReport(scan: ScanResult, user: Omit<User, 'passwordHash'> | null): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;
    
    // Header with logo/branding
    doc.setFillColor(30, 64, 175); // Blue color
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HBA Medical Report', margin, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Hand Bone Analysis System', margin, 26);
    
    // Report metadata
    doc.setFontSize(9);
    doc.text(`Report ID: ${scan.id}`, pageWidth - margin, 18, { align: 'right' });
    doc.text(`Generated: ${new Date(scan.createdAt).toLocaleString()}`, pageWidth - margin, 24, { align: 'right' });
    
    yPosition = 50;
    
    // Patient Information Section
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', margin, yPosition);
    yPosition += 2;
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const patientInfo = [
      ['Patient ID:', user?.id || 'N/A', 'Examination Date:', new Date(scan.createdAt).toLocaleDateString()],
      ['Patient Name:', user?.name || 'Anonymous', 'File Name:', scan.fileName],
      ['Age:', scan.metadata.patientAge?.toString() || 'Not provided', 'Image Size:', `${scan.metadata.width}×${scan.metadata.height}px`],
      ['Gender:', scan.metadata.patientGender || 'Not provided', 'File Size:', `${(scan.metadata.fileSize / 1024).toFixed(2)} KB`],
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: patientInfo,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        2: { fontStyle: 'bold', cellWidth: 35 },
      },
      margin: { left: margin },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Analysis Results Section
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Analysis Results', margin, yPosition);
    yPosition += 2;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    // Classification badge
    const classColors: Record<string, [number, number, number]> = {
      normal: [34, 197, 94],
      fracture: [239, 68, 68],
      degenerative: [245, 158, 11],
      deformity: [168, 85, 247],
    };
    
    const color = classColors[scan.classification] || [100, 100, 100];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPosition - 5, 60, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Classification: ${scan.classification.toUpperCase()}`,
      margin + 30,
      yPosition + 1,
      { align: 'center' }
    );
    
    // Confidence score
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Confidence: ${scan.confidence.toFixed(1)}%`, margin + 70, yPosition + 1);
    doc.text(`Processing Time: ${(scan.analysisTime / 1000).toFixed(2)}s`, pageWidth - margin, yPosition + 1, { align: 'right' });
    
    yPosition += 15;
    
    // Images Section
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Radiological Images', margin, yPosition);
    yPosition += 2;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    // Add images if possible
    try {
      const imgWidth = (pageWidth - 2 * margin - 10) / 3;
      const imgHeight = imgWidth * 0.75;
      
      if (scan.originalImageUrl) {
        doc.addImage(scan.originalImageUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text('Original X-Ray', margin + imgWidth / 2, yPosition + imgHeight + 5, { align: 'center' });
      }
      
      if (scan.processedImageUrl) {
        doc.addImage(scan.processedImageUrl, 'JPEG', margin + imgWidth + 5, yPosition, imgWidth, imgHeight);
        doc.text('Localized Findings', margin + imgWidth + 5 + imgWidth / 2, yPosition + imgHeight + 5, { align: 'center' });
      }
      
      if (scan.heatmapUrl) {
        doc.addImage(scan.heatmapUrl, 'JPEG', margin + (imgWidth + 5) * 2, yPosition, imgWidth, imgHeight);
        doc.text('Grad-CAM Heatmap', margin + (imgWidth + 5) * 2 + imgWidth / 2, yPosition + imgHeight + 5, { align: 'center' });
      }
      
      yPosition += imgHeight + 15;
    } catch (err) {
      yPosition += 10;
    }
    
    // Findings Section
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Findings', margin, yPosition);
    yPosition += 2;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    
    const findingsData = scan.findings.map((f) => [
      f.type,
      f.location,
      f.severity.charAt(0).toUpperCase() + f.severity.slice(1),
      f.description,
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Finding Type', 'Location', 'Severity', 'Description']],
      body: findingsData,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Recommendations Section
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Recommendations', margin, yPosition);
    yPosition += 2;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    scan.recommendations.forEach((rec, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}.`, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(rec, pageWidth - margin * 2 - 10);
      doc.text(splitText, margin + 8, yPosition);
      yPosition += splitText.length * 5 + 3;
    });
    
    yPosition += 10;
    
    // Disclaimer
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFillColor(254, 243, 199);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DISCLAIMER', margin + 5, yPosition + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 53, 15);
    const disclaimer = doc.splitTextToSize(
      'This AI-generated report is intended for clinical decision support only. Final diagnosis must be confirmed by a qualified radiologist. HBA analysis should be interpreted in conjunction with clinical history, physical examination, and other diagnostic findings.',
      pageWidth - 2 * margin - 10
    );
    doc.text(disclaimer, margin + 5, yPosition + 12);
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `HBA Report - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`HBA_Report_${scan.id}_${new Date().getTime()}.pdf`);
  },
};
