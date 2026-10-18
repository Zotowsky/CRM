import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AddOrderForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executors, setExecutors] = useState([]);
  const [formData, setFormData] = useState({
    client_name: '', client_phone: '', furniture_type: '', amount: '', wishes: '', executor_id: '', designer_id: '',
    start_date: '', deadline_date: '', payment_status: 'unpaid'
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
        executor_id: formData.executor_id || null,
        designer_id: formData.designer_id || null,
        start_date: formData.start_date || null,
        deadline_date: formData.deadline_date || null,
        status: 'new',
        position: 0,
        reference_images: imageUrls
      }]).select();

      if (error) throw error;
      if (data) onAdd(data[0]);
      
      setFormData({ client_name: '', client_phone: '', furniture_type: '', amount: '', wishes: '', executor_id: '', designer_id: '', start_date: '', deadline_date: '', payment_status: 'unpaid' });
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
      <button onClick={() => setIsOpen(!isOpen)} className="bg-cherry text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4a041b] transition shadow-sm">
        {isOpen ? 'Отменить' : '+ Добавить новый заказ'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white p-5 rounded-xl shadow-sm border border-matcha-border max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <input required type="text" placeholder="Имя клиента *" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          </div>
          
          <input type="text" placeholder="Телефон" value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          <input type="number" placeholder="Бюджет (₽)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          
          <input type="text" placeholder="Тип мебели" value={formData.furniture_type} onChange={e => setFormData({...formData, furniture_type: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          
          <select value={formData.payment_status} onChange={e => setFormData({...formData, payment_status: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark text-gray-700">
            <option value="unpaid">Оплата: Не оплачено</option>
            <option value="advance">Оплата: Внесен аванс</option>
            <option value="paid">Оплата: Оплачено полностью</option>
          </select>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Дата начала</label>
            <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark text-gray-700" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Дата сдачи (Дедлайн)</label>
            <input type="date" value={formData.deadline_date} onChange={e => setFormData({...formData, deadline_date: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark text-gray-700" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Проектировщик</label>
            <select value={formData.designer_id} onChange={e => setFormData({...formData, designer_id: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg text-gray-700 outline-none focus:border-matcha-dark">
              <option value="">-- Не назначен --</option>
              {executors.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Исполнитель (Сборщик)</label>
            <select value={formData.executor_id} onChange={e => setFormData({...formData, executor_id: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg text-gray-700 outline-none focus:border-matcha-dark">
              <option value="">-- Не назначен --</option>
              {executors.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <textarea rows="2" placeholder="Пожелания клиента..." value={formData.wishes} onChange={e => setFormData({...formData, wishes: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark"></textarea>
          </div>
          <div className="md:col-span-2">
            <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-matcha-light file:text-matcha-dark hover:file:bg-matcha-border" />
          </div>

          <div className="md:col-span-2 mt-2">
            <button disabled={loading} type="submit" className="w-full bg-cherry text-white py-2 rounded-lg hover:bg-[#4a041b] transition font-medium">
              {loading ? 'Сохранение...' : 'Сохранить заказ'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}