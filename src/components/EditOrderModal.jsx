import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function EditOrderModal({ order, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [executors, setExecutors] = useState([]);
  const [formData, setFormData] = useState({
    client_name: '', client_phone: '', furniture_type: '', amount: '', wishes: '', executor_id: '', designer_id: '',
    start_date: '', deadline_date: '', payment_status: 'unpaid'
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (order) {
      setFormData({
        client_name: order.client_name || '',
        client_phone: order.client_phone || '',
        furniture_type: order.furniture_type || '',
        amount: order.amount || '',
        wishes: order.wishes || '',
        executor_id: order.executor_id || '',
        designer_id: order.designer_id || '',
        start_date: order.start_date || '',
        deadline_date: order.deadline_date || '',
        payment_status: order.payment_status || 'unpaid'
      });
    }
    supabase.from('executors').select('*').then(({ data }) => setExecutors(data || []));
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImages = order.reference_images || [];
      if (files.length > 0) {
        const newImageUrls = [];
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('furniture-refs').upload(fileName, file);
          if (error) throw error;
          newImageUrls.push(supabase.storage.from('furniture-refs').getPublicUrl(fileName).data.publicUrl);
        }
        finalImages = [...finalImages, ...newImageUrls];
      }

      const updates = {
        ...formData,
        amount: formData.amount ? Number(formData.amount) : null,
        executor_id: formData.executor_id || null,
        designer_id: formData.designer_id || null,
        start_date: formData.start_date || null,
        deadline_date: formData.deadline_date || null,
        reference_images: finalImages
      };

      const { data, error } = await supabase.from('orders').update(updates).eq('id', order.id).select();
      if (error) throw error;
      
      onUpdate(data[0]);
      onClose();
    } catch (error) {
      alert('Ошибка при обновлении: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-matcha-border">
        <div className="p-4 border-b border-matcha-border flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-cherry">✏️ Редактировать заказ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-cherry text-2xl leading-none transition">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Имя клиента *</label>
            <input required type="text" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Телефон</label>
            <input type="text" value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Бюджет (₽)</label>
            <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Тип мебели</label>
            <input type="text" value={formData.furniture_type} onChange={e => setFormData({...formData, furniture_type: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Статус оплаты</label>
            <select value={formData.payment_status} onChange={e => setFormData({...formData, payment_status: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark text-gray-700">
              <option value="unpaid">Не оплачено</option>
              <option value="advance">Внесен аванс</option>
              <option value="paid">Оплачено полностью</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата начала</label>
            <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark text-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Дата сдачи (Дедлайн)</label>
            <input type="date" value={formData.deadline_date} onChange={e => setFormData({...formData, deadline_date: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark text-gray-700" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Проектировщик</label>
            <select value={formData.designer_id} onChange={e => setFormData({...formData, designer_id: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg text-gray-700 outline-none focus:border-matcha-dark">
              <option value="">-- Не назначен --</option>
              {executors.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Исполнитель (Сборщик)</label>
            <select value={formData.executor_id} onChange={e => setFormData({...formData, executor_id: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg text-gray-700 outline-none focus:border-matcha-dark">
              <option value="">-- Не назначен --</option>
              {executors.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Пожелания клиента</label>
            <textarea rows="2" value={formData.wishes} onChange={e => setFormData({...formData, wishes: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark"></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Добавить новые скриншоты</label>
            <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-matcha-light file:text-matcha-dark hover:file:bg-matcha-border" />
            {order.reference_images && order.reference_images.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Уже прикреплено фото: {order.reference_images.length}</p>
            )}
          </div>

          <div className="md:col-span-2 pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium">
              Отмена
            </button>
            <button disabled={loading} type="submit" className="flex-1 bg-cherry text-white py-2 rounded-lg hover:bg-[#4a041b] transition font-medium disabled:opacity-50">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}