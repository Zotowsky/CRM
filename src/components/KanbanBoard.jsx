import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext, closestCorners, PointerSensor,
  useSensor, useSensors, KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from './Column';
import AddOrderForm from './AddOrderForm';
import { supabase } from '../lib/supabase';

const COLUMNS = [
  { id: 'new',         title: 'Новый',      color: 'bg-cherry' },
  { id: 'in_progress', title: 'В работе',   color: 'bg-[#D4A373]' }, // Теплый акцент
  { id: 'done',        title: 'Завершён',   color: 'bg-matcha-dark' },
];

export default function KanbanBoard() {
  const [orders, setOrders] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      const { data } = await supabase.from('orders').select('*').eq('is_archived', false).order('position');
      if (!ignore) setOrders(data ?? []);
    };
    load();

    const channel = supabase.channel('orders-changes').on('postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        setOrders(prev => {
          if (payload.eventType === 'INSERT') return prev.some(o => o.id === payload.new.id) ? prev : [...prev, payload.new];
          if (payload.eventType === 'UPDATE') return payload.new.is_archived ? prev.filter(o => o.id !== payload.new.id) : prev.map(o => o.id === payload.new.id ? payload.new : o);
          if (payload.eventType === 'DELETE') return prev.filter(o => o.id !== payload.old.id);
          return prev;
        });
      }
    ).subscribe();

    return () => { ignore = true; supabase.removeChannel(channel); };
  }, []);

  const handleDragEnd = useCallback(async ({ active, over }) => {
    if (!over) return;
    const activeOrder = orders.find(o => o.id === active.id);
    if (!activeOrder) return;

    const overId = over.id;
    const overIsColumn = COLUMNS.some(c => c.id === overId);
    const targetOrder = orders.find(o => o.id === overId);
    const newStatus = overIsColumn ? overId : targetOrder?.status ?? activeOrder.status;

    const targetList = orders.filter(o => o.status === newStatus && o.id !== active.id).sort((a, b) => a.position - b.position);
    let insertAt = targetList.length;
    
    if (targetOrder && targetOrder.status === newStatus) {
      insertAt = targetList.findIndex(o => o.id === targetOrder.id);
      if (insertAt === -1) insertAt = targetList.length;
    }

    targetList.splice(insertAt, 0, { ...activeOrder, status: newStatus });

    setOrders(prev => {
      const others = prev.filter(o => o.id !== active.id && !(o.status === newStatus));
      return [...others, ...targetList.map((o, i) => ({ ...o, status: newStatus, position: i }))];
    });

    await supabase.from('orders').update({ status: newStatus }).eq('id', activeOrder.id);
    await Promise.all(targetList.map((o, i) => supabase.from('orders').update({ position: i }).eq('id', o.id)));
  }, [orders]);

  const handleArchive = async (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    await supabase.from('orders').update({ is_archived: true }).eq('id', id);
  };

  const handleAddOrder = (newOrder) => setOrders(prev => [...prev, newOrder]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-matcha-light">
      <div className="flex items-center justify-between mb-6 border-b-2 border-matcha pb-4">
        <h1 className="text-3xl font-serif font-bold text-cherry">
          📋 Мебельный CRM
        </h1>
      </div>

      <AddOrderForm onAdd={handleAddOrder} />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              orders={orders.filter(o => o.status === col.id).sort((a, b) => a.position - b.position)}
              onArchive={handleArchive}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}