import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import OrderCard from './OrderCard';

export default function ExecutorDashboard({ userEmail, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [executorName, setExecutorName] = useState('');
  const [tab, setTab] = useState('active'); // 'active' или 'done'

  useEffect(() => {
    const loadData = async () => {
      // Находим исполнителя по email
      const { data: exec } = await supabase.from('executors').select('id, name').eq('email', userEmail).single();
      
      if (exec) {
        setExecutorName(exec.name);
        // Загружаем его заказы
        const { data } = await supabase.from('orders')
          .select('*')
          .eq('executor_id', exec.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });
        setOrders(data || []);
      }
    };
    loadData();
  }, [userEmail]);

  // Фильтруем заказы для вкладок
  const activeOrders = orders.filter(o => o.status !== 'done');
  const doneOrders = orders.filter(o => o.status === 'done');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Кабинет исполнителя</h1>
          <p className="text-gray-500">Сотрудник: {executorName || userEmail}</p>
        </div>
        <button onClick={onLogout} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition">Выйти</button>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button 
          onClick={() => setTab('active')} 
          className={`pb-2 px-2 font-medium ${tab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          В работе ({activeOrders.length})
        </button>
        <button 
          onClick={() => setTab('done')} 
          className={`pb-2 px-2 font-medium ${tab === 'done' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          Завершенные ({doneOrders.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(tab === 'active' ? activeOrders : doneOrders).map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onArchive={() => {}} // Архивация доступна только на доске
          />
        ))}
        {(tab === 'active' ? activeOrders : doneOrders).length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-10">Заказов нет</p>
        )}
      </div>
    </div>
  );
}