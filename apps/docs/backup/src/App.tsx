import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DocumentListPage } from './pages/DocumentListPage';
import { DocumentEditorPage } from './pages/DocumentEditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentListPage />} />
        <Route path="/documents/:documentId" element={<DocumentEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
