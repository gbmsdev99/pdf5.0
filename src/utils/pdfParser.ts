import * as PDFJS from 'pdfjs-dist';
import { Question, QuestionOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initialize PDF.js worker
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Parse a PDF file and extract questions
export async function parsePdf(file: File): Promise<Omit<Question, 'id'>[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    
    const questions: Omit<Question, 'id'>[] = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => 'str' in item ? item.str : '')
        .join('\n');
      
      // Parse questions from the page text
      const pageQuestions = parseQuestionsFromText(pageText);
      questions.push(...pageQuestions);
    }
    
    return questions;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF. Please make sure it follows the required format.');
  }
}

// Extract questions from text content
function parseQuestionsFromText(text: string): Omit<Question, 'id'>[] {
  const questions: Omit<Question, 'id'>[] = [];
  
  // Regular expression to match questions
  // Format: Q1. Question text\nA. Option A\nB. Option B\nC. Option C\nD. Option D\nAnswer: X
  const questionRegex = /Q\d+\.\s+(.*?)(?=(?:Q\d+\.)|$)/gs;
  
  let match;
  while ((match = questionRegex.exec(text)) !== null) {
    const questionBlock = match[0].trim();
    
    // Extract question text
    const questionTextMatch = questionBlock.match(/Q\d+\.\s+(.*?)(?=A\.)/s);
    if (!questionTextMatch) continue;
    
    const questionText = questionTextMatch[1].trim();
    
    // Extract options
    const options: QuestionOption[] = [];
    const optionsRegex = /([A-D])\.\s+(.*?)(?=(?:[A-D]\.)|(?:Answer:)|$)/gs;
    
    let optionMatch;
    while ((optionMatch = optionsRegex.exec(questionBlock)) !== null) {
      options.push({
        id: uuidv4(),
        text: optionMatch[2].trim()
      });
    }
    
    // Extract correct answer
    const answerMatch = questionBlock.match(/Answer:\s+([A-D])/);
    if (!answerMatch) continue;
    
    const correctAnswer = answerMatch[1];
    const correctOptionIndex = correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
    
    if (options.length === 4) {
      questions.push({
        text: questionText,
        options,
        correctOptionIndex
      });
    }
  }
  
  return questions;
}