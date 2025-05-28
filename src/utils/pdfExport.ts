import { jsPDF } from 'jspdf';
import { TestResult } from '../types';

export function generateResultPDF(result: TestResult): void {
  const doc = new jsPDF();
  
  // Add header with logo
  doc.setFontSize(22);
  doc.setTextColor(48, 79, 254); // Indigo color
  doc.text('Test Result Certificate', 105, 20, { align: 'center' });
  
  // Add certificate border
  doc.setDrawColor(48, 79, 254);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);
  
  // Add test information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const scorePercentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const submittedDate = new Date(result.submittedAt).toLocaleDateString();
  const timeTaken = formatTime(result.timeTaken);
  
  // Test details
  doc.setFontSize(14);
  doc.text('Test Details', 20, 40);
  doc.setFontSize(12);
  doc.text(`Test Title: ${result.testTitle}`, 20, 55);
  doc.text(`Date: ${submittedDate}`, 20, 65);
  doc.text(`Duration: ${timeTaken}`, 20, 75);
  
  // Score section
  doc.setFontSize(14);
  doc.text('Score Summary', 20, 95);
  doc.setFontSize(12);
  doc.text(`Total Questions: ${result.totalQuestions}`, 20, 110);
  doc.text(`Correct Answers: ${result.correctAnswers}`, 20, 120);
  doc.text(`Score Percentage: ${scorePercentage}%`, 20, 130);
  
  // Performance rating
  let performanceText = '';
  if (scorePercentage >= 90) performanceText = 'Excellent';
  else if (scorePercentage >= 80) performanceText = 'Very Good';
  else if (scorePercentage >= 70) performanceText = 'Good';
  else if (scorePercentage >= 60) performanceText = 'Satisfactory';
  else performanceText = 'Needs Improvement';
  
  doc.text(`Performance Rating: ${performanceText}`, 20, 140);
  
  // Security information
  if (result.violations > 0) {
    doc.setFontSize(14);
    doc.text('Security Notes', 20, 160);
    doc.setFontSize(12);
    doc.text(`Security Violations: ${result.violations}`, 20, 175);
  }
  
  // Add certification
  doc.setFontSize(14);
  doc.text('Certification', 20, 200);
  doc.setFontSize(12);
  doc.text('This is to certify that this test was completed under', 20, 215);
  doc.text('the specified conditions and the results are authentic.', 20, 225);
  
  // Add signature
  doc.setFontSize(12);
  doc.text('Certified by:', 20, 250);
  doc.setFontSize(14);
  doc.setTextColor(48, 79, 254);
  doc.text('Aftab Alam', 20, 260);
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Test Platform Developer', 20, 265);
  
  // Add QR code or verification text
  doc.setFontSize(8);
  doc.text(`Verification ID: ${result.id}`, 20, 280);
  doc.text('PDF Test Maker - 100% Free Forever', 105, 285, { align: 'center' });
  
  // Save the PDF
  doc.save(`test-result-${result.id}.pdf`);
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} minutes ${remainingSeconds} seconds`;
}