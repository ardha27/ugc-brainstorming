import { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Layout } from '../components/layout';
import { KanbanColumn, CardDetailModal } from '../components/kanban';
import { EmptyState, Button } from '../components/common';
import { api } from '../lib/api';

export function KanbanBoard() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = ['ideas', 'script_ready', 'in_production', 'published'];

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const data = await api.getIdeas();
      setIdeas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId;
    const idea = ideas.find(i => i.id === draggableId);

    // Optimistic update
    setIdeas(prev => prev.map(i =>
      i.id === draggableId ? { ...i, status: newStatus } : i
    ));

    try {
      await api.updateIdea(draggableId, { status: newStatus });
    } catch (err) {
      // Rollback on error
      setIdeas(prev => prev.map(i =>
        i.id === draggableId ? { ...i, status: idea.status } : i
      ));
      setError('Failed to update idea');
    }
  };

  const handleDeleteIdea = async (id) => {
    try {
      await api.deleteIdea(id);
      setIdeas(prev => prev.filter(i => i.id !== id));
      setSelectedIdea(null);
    } catch (err) {
      setError('Failed to delete idea');
    }
  };

  const getIdeasByStatus = (status) => {
    return ideas.filter(idea => idea.status === status);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanban Board</h1>
        <p className="text-gray-600">Kelola ide dari brainstorm sampai published</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {ideas.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Belum ada ide"
          description="Mulai dengan generate ide baru atau tunggu trending topics terbaru"
          actionLabel="Generate Idea"
          onAction={() => window.location.href = '/generate'}
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map(column => (
              <KanbanColumn
                key={column}
                column={column}
                ideas={getIdeasByStatus(column)}
                onCardClick={setSelectedIdea}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {selectedIdea && (
        <CardDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onDelete={handleDeleteIdea}
        />
      )}
    </Layout>
  );
}
