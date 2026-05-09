import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { GenerateIdea } from './pages/GenerateIdea';
import { KanbanBoard } from './pages/KanbanBoard';
import { TrendingTopics } from './pages/TrendingTopics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generate" element={<GenerateIdea />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/trends" element={<TrendingTopics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
