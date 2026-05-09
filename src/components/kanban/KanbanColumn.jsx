import { Droppable, Draggable } from 'react-beautiful-dnd';
import { IdeaCard } from './IdeaCard';
import { EmptyState } from '../common';

export function KanbanColumn({ column, ideas, onCardClick }) {
  const columnColors = {
    ideas: 'bg-gray-100',
    script_ready: 'bg-blue-100',
    in_production: 'bg-orange-100',
    published: 'bg-green-100',
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
        <h2 className="font-bold text-gray-900 flex items-center justify-between">
          <span>{columnTitles[column]}</span>
          <span className="text-sm font-normal text-gray-600">({ideas.length})</span>
        </h2>
      </div>

      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`bg-gray-50 rounded-b-lg p-4 min-h-[500px] space-y-3 ${
              snapshot.isDraggingOver ? 'bg-indigo-50' : ''
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
