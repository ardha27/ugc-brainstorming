import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { GenerateIdea } from './pages/GenerateIdea';
import { KanbanBoard } from './pages/KanbanBoard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generate" element={<GenerateIdea />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/trends" element={<div className="p-8"><h1 className="text-2xl font-bold">Trending Topics - Coming Soon</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
