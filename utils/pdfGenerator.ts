import { SummaryData } from '../types';

declare global {
  interface Window {
    jspdf: any;
  }
}

export const generatePDF = (summary: SummaryData) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = doc.internal.pageSize.width - margin * 2;

  const checkPageBreak = (heightToAdd: number) => {
    if (yPos + heightToAdd >= pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138); // Dark blue
  doc.text(summary.title || "Lernzusammenfassung", margin, yPos);
  yPos += 15;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Erstellt mit SmartLearn AI am ${new Date().toLocaleDateString('de-DE')}`, margin, yPos);
  yPos += 15;

  summary.chapters.forEach((chapter, cIndex) => {
    checkPageBreak(20);
    // Chapter Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`${cIndex + 1}. ${chapter.title}`, margin, yPos);
    yPos += 10;

    chapter.topics.forEach((topic) => {
      checkPageBreak(20);
      // Topic Title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.text(topic.title, margin, yPos);
      yPos += 7;

      // Topic Content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      
      const splitText = doc.splitTextToSize(topic.content, contentWidth);
      checkPageBreak(splitText.length * 5);
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * 5 + 5;

      // Study Questions
      if (topic.studyQuestions && topic.studyQuestions.length > 0) {
        checkPageBreak(15);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text("Lernfragen:", margin + 5, yPos);
        yPos += 5;
        
        topic.studyQuestions.forEach((q) => {
            const splitQ = doc.splitTextToSize(`• ${q}`, contentWidth - 5);
            checkPageBreak(splitQ.length * 5);
            doc.text(splitQ, margin + 5, yPos);
            yPos += splitQ.length * 5 + 2;
        });
        yPos += 5;
      }
    });
    
    yPos += 5;
    // Add a line between chapters
    doc.setDrawColor(200);
    doc.line(margin, yPos, margin + contentWidth, yPos);
    yPos += 10;
  });

  doc.save('Lernzusammenfassung.pdf');
};