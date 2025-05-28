import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, Search } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "General",
    question: "What is PDF Test Maker?",
    answer: "PDF Test Maker is a completely free, offline application that allows educators and professionals to create, manage, and conduct tests securely. It supports PDF question extraction, manual question entry with LaTeX and image support, and provides comprehensive test management features."
  },
  {
    category: "General",
    question: "Is it really free?",
    answer: "Yes! PDF Test Maker is 100% free to use. There are no hidden costs, subscriptions, or premium features. Everything is available to all users without any limitations."
  },
  {
    category: "Features",
    question: "Can I use mathematical equations in my questions?",
    answer: "Yes! PDF Test Maker supports LaTeX equations in both questions and answers. You can use the LaTeX helper to easily insert common mathematical expressions and formulas."
  },
  {
    category: "Features",
    question: "How does the security system work?",
    answer: "The application includes multiple security features: fullscreen mode requirement, tab switching detection, copy/paste prevention, and automatic test submission after security violations. All these features help maintain test integrity."
  },
  {
    category: "Technical",
    question: "Does this work offline?",
    answer: "Yes! Once loaded, the application works entirely offline. All data is stored locally in your browser, ensuring privacy and accessibility without an internet connection."
  },
  {
    category: "Technical",
    question: "Where is my data stored?",
    answer: "All data (tests, questions, and results) is stored locally in your browser's storage. No data is sent to any external servers, ensuring complete privacy and data control."
  },
  {
    category: "Usage",
    question: "How do I create a test from a PDF?",
    answer: "Upload a PDF file containing questions in the required format. The application will automatically extract questions, options, and correct answers. You can then review and edit them before finalizing the test."
  },
  {
    category: "Usage",
    question: "Can I add images to questions?",
    answer: "Yes! When creating questions manually, you can upload images and include them in your questions. The images are stored locally and displayed during the test."
  },
  {
    category: "Results",
    question: "How can I view test results?",
    answer: "Navigate to the Results page to view detailed statistics for all completed tests. You can see scores, time taken, and any security violations. Results can also be exported to CSV format."
  },
  {
    category: "Support",
    question: "What if I find a bug?",
    answer: "While the application is thoroughly tested, if you encounter any issues, you can report them to the developer, Aftab Alam, through the project's support channels."
  }
];

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleItem = (question: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about PDF Test Maker. If you can't find what you're looking for,
          please check the user manual for more detailed information.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            !selectedCategory
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === category
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.question}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            <button
              onClick={() => toggleItem(faq.question)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="font-medium text-gray-900">{faq.question}</span>
              </div>
              {expandedItems.has(faq.question) ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedItems.has(faq.question) && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-indigo-50 rounded-lg p-6 inline-block">
          <p className="text-indigo-900 font-medium">
            Developed by Aftab Alam
          </p>
          <p className="text-indigo-700 mt-1">
            This software is 1000001% FREE and will always remain free!
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Made with ❤️ for educators and students worldwide
          </p>
        </div>
      </div>
    </div>
  );
}