import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function OrderCard({ order, onArchive, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: order.id, data: { order } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-xl shadow-sm border border-matcha-border p-3 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition group relative"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-sm text-cherry">{order.client_name}</h4>
          {order.client_phone && <p className="text-xs text-gray-500 mt-0.5">{order.client_phone}</p>}
        </div>
        
        {/* Блок с кнопками (показываются при наведении) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/90 rounded backdrop-blur-sm">
          {onEdit && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(order); }}
              className="text-gray-400 hover:text-cherry p-1"
              title="Редактировать"
            >✏️</button>
          )}
          {order.status === 'done' && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onArchive(order.id)}
              className="text-gray-400 hover:text-cherry p-1"
              title="В архив"
            >✕</button>
          )}
        </div>
      </div>
      
      <div className="pr-12"> {/* Отступ, чтобы текст не залезал под кнопки */}
        {order.furniture_type && (
          <p className="text-xs font-medium text-matcha-dark mt-2 uppercase tracking-wide">{order.furniture_type}</p>
        )}

        {order.wishes && (
          <div className="mt-2 bg-matcha-light p-2 rounded text-xs text-gray-700 italic border-l-2 border-matcha">
            "{order.wishes}"
          </div>
        )}

        {order.reference_images && order.reference_images.length > 0 && (
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
            {order.reference_images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" onPointerDown={(e) => e.stopPropagation()}>
                <img src={url} alt="ref" className="w-10 h-10 object-cover rounded border border-matcha-border hover:opacity-80 transition" />
              </a>
            ))}
          </div>
        )}

        {order.amount != null && (
          <p className="text-sm font-bold text-cherry mt-2">
            {Number(order.amount).toLocaleString('ru-RU')} ₽
          </p>
        )}
      </div>
    </div>
  );
}