import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Book, FileUp, Edit, Settings, Play, BarChart, Search, ChevronDown, ChevronRight,
  ListChecks, FileQuestion, Clock, Users, Database, FileOutput, Tag, BarChart2
} from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { QuestionType, DifficultyLevel } from '../types';

export function UserManualPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'getting-started': true
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="text-lg font-medium text-gray-900">{title}</span>
        {expandedSections[id] ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="pb-6 prose prose-indigo max-w-none">
          {children}
        </div>
      )}
    </div>
  );

  const CodeExample = ({ code }: { code: string }) => (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <SyntaxHighlighter language="text" style={docco}>
        {code}
      </SyntaxHighlighter>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Book className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">User Manual</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <Section id="getting-started" title="Getting Started">
            <p className="text-gray-700 mb-4">
              Welcome to PDF Test Maker! This offline application allows you to create, manage, and take tests securely. Here's how to get started:
            </p>

            <h3 className="text-xl font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <FileUp className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>Upload PDF files containing questions</span>
              </li>
              <li className="flex items-start">
                <Edit className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>Create questions manually with LaTeX and image support</span>
              </li>
              <li className="flex items-start">
                <Settings className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>Customize test settings and security features</span>
              </li>
              <li className="flex items-start">
                <Play className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>Take tests in a secure environment</span>
              </li>
              <li className="flex items-start">
                <BarChart className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>View and analyze test results</span>
              </li>
            </ul>
          </Section>

          <Section id="question-types" title="Question Types">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Multiple Choice</h3>
                <CodeExample code={`Q1. What is the capital of France?
A. Berlin
B. Paris
C. London
D. Madrid
Answer: B`} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">True/False</h3>
                <CodeExample code={`Q1. [TRUE_FALSE] The Earth is flat.
Answer: False`} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Fill in the Blank</h3>
                <CodeExample code={`Q1. [FILL_IN_BLANK] The process of photosynthesis occurs in the [___] of plant cells.
Answer: chloroplasts
Alternatives: chloroplast, Chloroplasts`} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Matching</h3>
                <CodeExample code={`Q1. [MATCHING] Match the following:
1. Oxygen | Essential for breathing
2. Hydrogen | Lightest element
3. Carbon | Basic building block of life
4. Nitrogen | Main component of air`} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Short Answer</h3>
                <CodeExample code={`Q1. [SHORT_ANSWER] Explain the process of photosynthesis.
Keywords: sunlight, chlorophyll, carbon dioxide, water, glucose, oxygen
Model Answer: Photosynthesis is the process where plants use sunlight, chlorophyll, carbon dioxide, and water to produce glucose and oxygen.`} />
              </div>
            </div>
          </Section>

          <Section id="sections-timers" title="Sections and Timers">
            <div className="space-y-4">
              <p className="text-gray-700">
                Tests can be divided into sections, each with its own time limit and settings:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Section Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 text-indigo-600 mr-2" />
                    Individual time limits per section
                  </li>
                  <li className="flex items-center">
                    <ListChecks className="h-4 w-4 text-indigo-600 mr-2" />
                    Group related questions together
                  </li>
                  <li className="flex items-center">
                    <Settings className="h-4 w-4 text-indigo-600 mr-2" />
                    Section-specific settings (shuffling, navigation)
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="question-bank" title="Question Bank">
            <div className="space-y-4">
              <p className="text-gray-700">
                Save and organize frequently used questions in your personal question bank:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Organization</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Tag className="h-4 w-4 text-indigo-600 mr-2" />
                      Tag questions for easy filtering
                    </li>
                    <li className="flex items-center">
                      <FileQuestion className="h-4 w-4 text-indigo-600 mr-2" />
                      Set difficulty levels
                    </li>
                    <li className="flex items-center">
                      <Database className="h-4 w-4 text-indigo-600 mr-2" />
                      Create multiple question banks
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Collaboration</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Users className="h-4 w-4 text-indigo-600 mr-2" />
                      Share with other instructors
                    </li>
                    <li className="flex items-center">
                      <Edit className="h-4 w-4 text-indigo-600 mr-2" />
                      Collaborative editing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          <Section id="export-options" title="Export Options">
            <div className="space-y-4">
              <p className="text-gray-700">
                Export your tests in various formats:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Document Formats</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <FileOutput className="h-4 w-4 text-indigo-600 mr-2" />
                      PDF with customizable layout
                    </li>
                    <li className="flex items-center">
                      <FileOutput className="h-4 w-4 text-indigo-600 mr-2" />
                      Word document (DOCX)
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Platform Export</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <FileOutput className="h-4 w-4 text-indigo-600 mr-2" />
                      Google Forms format
                    </li>
                    <li className="flex items-center">
                      <FileOutput className="h-4 w-4 text-indigo-600 mr-2" />
                      Moodle-compatible format
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          <Section id="analytics" title="Analytics & Tracking">
            <div className="space-y-4">
              <p className="text-gray-700">
                Track and analyze test creation and performance:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Question Analytics</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-indigo-600 mr-2" />
                      Auto-generated vs. manual questions
                    </li>
                    <li className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-indigo-600 mr-2" />
                      Question type distribution
                    </li>
                    <li className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-indigo-600 mr-2" />
                      Difficulty level breakdown
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Performance Tracking</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-indigo-600 mr-2" />
                      Section-wise performance
                    </li>
                    <li className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-indigo-600 mr-2" />
                      Time spent per section
                    </li>
                    <li className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-indigo-600 mr-2" />
                      Question difficulty analysis
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="bg-gray-50 p-6 rounded-b-lg">
          <div className="flex items-start">
            <Search className="h-5 w-5 text-indigo-600 mr-3 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Need Help?</h3>
              <p className="text-gray-600 mt-1">
                This manual covers all features. For additional help, check out our FAQ section.
              </p>
              <p className="text-sm text-indigo-600 mt-2">
                Developed by Aftab Alam | 1000001% FREE Forever!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}