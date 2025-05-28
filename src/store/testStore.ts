import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Question, Test, TestSettings, TestResult } from '../types';

interface TestState {
  // Current test being created/edited
  currentTest: Test | null;
  // Current test being taken
  activeTest: Test | null;
  // All saved tests
  savedTests: Test[];
  // All test results
  testResults: TestResult[];
  // Current violations count
  violations: number;
  
  // Actions for test creation
  createNewTest: () => void;
  updateTestSettings: (settings: TestSettings) => void;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (questionId: string, question: Omit<Question, 'id'>) => void;
  removeQuestion: (questionId: string) => void;
  saveTest: () => void;
  
  // Actions for test taking
  startTest: (testId: string) => void;
  submitTest: (answers: Record<string, number>, timeTaken: number) => void;
  recordViolation: () => void;
  
  // Data management
  loadFromStorage: () => void;
  clearCurrentTest: () => void;
}

// Helper to save to localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Helper to load from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const useTestStore = create<TestState>((set, get) => ({
  currentTest: null,
  activeTest: null,
  savedTests: [],
  testResults: [],
  violations: 0,
  
  createNewTest: () => {
    const newTest: Test = {
      id: uuidv4(),
      settings: {
        title: 'New Test',
        description: '',
        duration: 30,
        shuffleQuestions: false,
        freeNavigation: true,
        requireFullscreen: true,
      },
      questions: [],
      createdAt: new Date().toISOString(),
    };
    
    set({ currentTest: newTest });
  },
  
  updateTestSettings: (settings: TestSettings) => {
    set((state) => {
      if (!state.currentTest) return state;
      
      const updatedTest = {
        ...state.currentTest,
        settings,
      };
      
      return { currentTest: updatedTest };
    });
  },
  
  addQuestion: (question) => {
    set((state) => {
      if (!state.currentTest) return state;
      
      const newQuestion: Question = {
        ...question,
        id: uuidv4(),
      };
      
      const updatedTest = {
        ...state.currentTest,
        questions: [...state.currentTest.questions, newQuestion],
      };
      
      return { currentTest: updatedTest };
    });
  },
  
  updateQuestion: (questionId, question) => {
    set((state) => {
      if (!state.currentTest) return state;
      
      const updatedQuestions = state.currentTest.questions.map((q) => 
        q.id === questionId ? { ...question, id: questionId } : q
      );
      
      const updatedTest = {
        ...state.currentTest,
        questions: updatedQuestions,
      };
      
      return { currentTest: updatedTest };
    });
  },
  
  removeQuestion: (questionId) => {
    set((state) => {
      if (!state.currentTest) return state;
      
      const updatedQuestions = state.currentTest.questions.filter(
        (q) => q.id !== questionId
      );
      
      const updatedTest = {
        ...state.currentTest,
        questions: updatedQuestions,
      };
      
      return { currentTest: updatedTest };
    });
  },
  
  saveTest: () => {
    const { currentTest, savedTests } = get();
    
    if (!currentTest) return;
    
    // Check if test already exists
    const existingIndex = savedTests.findIndex((t) => t.id === currentTest.id);
    
    let updatedTests: Test[];
    
    if (existingIndex >= 0) {
      // Update existing test
      updatedTests = [
        ...savedTests.slice(0, existingIndex),
        currentTest,
        ...savedTests.slice(existingIndex + 1),
      ];
    } else {
      // Add new test
      updatedTests = [...savedTests, currentTest];
    }
    
    set({ savedTests: updatedTests });
    saveToStorage('savedTests', updatedTests);
  },
  
  startTest: (testId) => {
    const { savedTests } = get();
    
    const test = savedTests.find((t) => t.id === testId);
    
    if (test) {
      set({ 
        activeTest: test,
        violations: 0 
      });
    }
  },
  
  submitTest: (answers, timeTaken) => {
    const { activeTest, testResults, violations } = get();
    
    if (!activeTest) return;
    
    const correctAnswers = Object.entries(answers).reduce((count, [questionId, selectedOptionIndex]) => {
      const question = activeTest.questions.find((q) => q.id === questionId);
      
      if (question && question.correctOptionIndex === selectedOptionIndex) {
        return count + 1;
      }
      
      return count;
    }, 0);
    
    const newResult: TestResult = {
      id: uuidv4(),
      testId: activeTest.id,
      testTitle: activeTest.settings.title,
      totalQuestions: activeTest.questions.length,
      correctAnswers,
      timeTaken,
      submittedAt: new Date().toISOString(),
      answers,
      violations,
    };
    
    const updatedResults = [...testResults, newResult];
    
    set({
      testResults: updatedResults,
      activeTest: null,
      violations: 0,
    });
    
    saveToStorage('testResults', updatedResults);
    
    return newResult;
  },
  
  recordViolation: () => {
    set((state) => ({
      violations: state.violations + 1
    }));
  },
  
  loadFromStorage: () => {
    const savedTests = loadFromStorage<Test[]>('savedTests', []);
    const testResults = loadFromStorage<TestResult[]>('testResults', []);
    
    set({ savedTests, testResults });
  },
  
  clearCurrentTest: () => {
    set({ currentTest: null });
  },
}));