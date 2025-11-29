import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FormBuilder from './components/FormBuilder';
import FormViewer from './components/FormViewer';
import ResponseViewer from './components/ResponseViewer';

const App: React.FC = () => {
  console.log('App component rendering...');
  
  return (
    <div className="min-h-screen">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder/:id" element={<FormBuilder />} />
          <Route path="/form/:id" element={<FormViewer />} />
          <Route path="/responses/:id" element={<ResponseViewer />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
