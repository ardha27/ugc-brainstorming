import { Droppable, Draggable } from 'react-beautiful-dnd';
import { IdeaCard } from './IdeaCard';
import { EmptyState } from '../common';

export function KanbanColumn({ column, ideas, onCardClick }) {
  const columnColors = {
    ideas: 'bg-gray-700',
    script_ready: 'bg-blue-900',
    in_production: 'bg-orange-900',
    published: 'bg-green-900',
  };

  const columnTitles = {
    ideas: 'Ideas',
    script_ready: 'Script Ready',
    in_production: 'In Production',
    published: 'Published',
  };

  return (
    <div className="flex-1 min-w-[300px]">
      <div className={`${columnColors[column]} rounded-t-lg px-4 py-3`}>
        <h2 className="font-bold text-gray-100 flex items-center justify-between">
          <span>{columnTitles[column]}</span>
          <span className="text-sm font-normal text-gray-400">({ideas.length})</span>
        </h2>
      </div>

      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`bg-gray-800/50 rounded-b-lg p-4 min-h-[500px] space-y-3 border border-t-0 border-gray-700 ${
              snapshot.isDraggingOver ? 'bg-indigo-900/30 border-primary' : ''
            }`}
          >
            {ideas.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No ideas yet"
                description={`Drag ideas here or generate new ones`}
              />
            ) : (
              ideas.map((idea, index) => (
                <Draggable key={idea.id} draggableId={idea.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'opacity-50' : ''}
                    >
                      <IdeaCard idea={idea} onClick={() => onCardClick(idea)} />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}