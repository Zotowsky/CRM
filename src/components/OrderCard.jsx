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

  // Логика дедлайна
  let deadlineBadge = null;
  if (order.deadline_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(order.deadline_date);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      deadlineBadge = <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">🔥 ПРОСРОЧЕН</span>;
    } else if (diffDays <= 2) {
      deadlineBadge = <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">⏳ СКОРО ({diffDays} дн.)</span>;
    } else {
      deadlineBadge = <span className="text-gray-500 text-[10px]">📅 до {new Date(order.deadline_date).toLocaleDateString('ru-RU')}</span>;
    }
  }

  // Логика оплаты
  let paymentBadge = null;
  if (order.payment_status === 'paid') paymentBadge = <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">💰 Оплачено</span>;
  else if (order.payment_status === 'advance') paymentBadge = <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">💸 Аванс</span>;
  else paymentBadge = <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">❌ Не оплачено</span>;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-xl shadow-sm border border-matcha-border p-3 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition group relative"
    >
      <div className="flex justify-between items-start">
        <div className="pr-12">
          <h4 className="font-semibold text-sm text-cherry">{order.client_name}</h4>
          {order.client_phone && <p className="text-xs text-gray-500 mt-0.5">{order.client_phone}</p>}
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/90 rounded backdrop-blur-sm z-10">
          {onEdit && (
            <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onEdit(order); }} className="text-gray-400 hover:text-cherry p-1" title="Редактировать">✏️</button>
          )}
          {order.status === 'done' && (
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onArchive(order.id)} className="text-gray-400 hover:text-cherry p-1" title="В архив">✕</button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mt-2">
        {order.furniture_type && <span className="text-xs font-medium text-matcha-dark uppercase tracking-wide bg-matcha-light px-2 py-0.5 rounded">{order.furniture_type}</span>}
        {deadlineBadge}
        {paymentBadge}
      </div>

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

      <div className="flex justify-between items-end mt-2">
        {order.amount != null ? (
          <p className="text-sm font-bold text-cherry">{Number(order.amount).toLocaleString('ru-RU')} ₽</p>
        ) : <span></span>}
        {order.start_date && <p className="text-[10px] text-gray-400">Начало: {new Date(order.start_date).toLocaleDateString('ru-RU')}</p>}
      </div>
    </div>
  );
}