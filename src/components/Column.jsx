import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import OrderCard from './OrderCard';

export default function Column({ id, title, color, orders, onArchive }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] rounded-2xl p-3 transition ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
        </div>
        <span className="text-xs text-gray-400">{orders.length}</span>
      </div>
      <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[60px]">
          {orders.map(o => (
            <OrderCard key={o.id} order={o} onArchive={onArchive} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}