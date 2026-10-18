import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import OrderCard from './OrderCard';

export default function Column({ id, title, color, orders, onArchive, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] rounded-2xl p-3 transition ${
        isOver ? 'bg-matcha/40 ring-2 ring-cherry' : 'bg-matcha-light/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-bold text-cherry text-sm">{title}</h3>
        </div>
        <span className="text-xs font-bold text-matcha-dark bg-white px-2 py-0.5 rounded-full shadow-sm">{orders.length}</span>
      </div>
      <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[100px]">
          {orders.map(o => (
            <OrderCard 
              key={o.id} 
              order={o} 
              onArchive={onArchive} 
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}