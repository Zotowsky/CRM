import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AddOrderForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executors, setExecutors] = useState([]); // Список исполнителей
  const [formData, setFormData] = useState({
    client_name: '', client_phone: '', furniture_type: '', amount: '', wishes: '', executor_id: ''
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      supabase.from('executors').select('*').then(({ data }) => setExecutors(data || []));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('furniture-refs').upload(fileName, file);
        if (error) throw error;
        imageUrls.push(supabase.storage.from('furniture-refs').getPublicUrl(fileName).data.publicUrl);
      }

      const { data, error } = await supabase.from('orders').insert([{
        ...formData,
        amount: formData.amount ? Number(formData.amount) : null,
        executor_id: formData.executor_id || null, // Привязываем исполнителя
        status: 'new',
        position: 0,
        reference_images: imageUrls
      }]).select();

      if (error) throw error;
      if (data) onAdd(data[0]);
      setFormData({ client_name: '', client_phone: '', furniture_type: '', amount: '', wishes: '', executor_id: '' });
      setFiles([]);
      setIsOpen(false);
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
        {isOpen ? 'Отменить' : '+ Добавить новый заказ'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 max-w-lg space-y-3">
          <input required type="text" placeholder="Имя клиента *" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full border p-2 rounded-lg" />
          <div className="flex gap-3">
            <input type="text" placeholder="Телефон" value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})} className="w-full border p-2 rounded-lg" />
            <input type="number" placeholder="Бюджет (₽)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border p-2 rounded-lg" />
          </div>
          <input type="text" placeholder="Тип мебели" value={formData.furniture_type} onChange={e => setFormData({...formData, furniture_type: e.target.value})} className="w-full border p-2 rounded-lg" />
          
          {/* Выбор исполнителя */}
          <select value={formData.executor_id} onChange={e => setFormData({...formData, executor_id: e.target.value})} className="w-full border p-2 rounded-lg text-gray-700">
            <option value="">-- Не назначен --</option>
            {executors.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>

          <textarea rows="2" placeholder="Пожелания клиента..." value={formData.wishes} onChange={e => setFormData({...formData, wishes: e.target.value})} className="w-full border p-2 rounded-lg"></textarea>
          <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="w-full text-sm" />
          <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition">
            {loading ? 'Сохранение...' : 'Сохранить заказ'}
          </button>
        </form>
      )}
    </div>
  );
}