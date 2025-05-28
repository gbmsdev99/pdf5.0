import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTestStore } from './store/testStore';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ManualEntryPage } from './pages/ManualEntryPage';
import { PreviewPage } from './pages/PreviewPage';
import { SettingsPage } from './pages/SettingsPage';
import { InstructionsPage } from './pages/InstructionsPage';
import { TestPage } from './pages/TestPage';
import { SubmittedPage } from './pages/SubmittedPage';
import { ResultsPage } from './pages/ResultsPage';
import { UserManualPage } from './pages/UserManualPage';
import { FAQPage } from './pages/FAQPage';

function App() {
  const { loadFromStorage } = useTestStore();
  
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="manual-entry" element={<ManualEntryPage />} />
          <Route path="preview" element={<PreviewPage />} />
          <Route path="preview/:testId" element={<PreviewPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="instructions/:testId" element={<InstructionsPage />} />
          <Route path="submitted" element={<SubmittedPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="manual" element={<UserManualPage />} />
          <Route path="faq" element={<FAQPage />} />
        </Route>
        <Route path="test" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App