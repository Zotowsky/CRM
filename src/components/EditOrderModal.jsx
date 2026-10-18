import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function EditOrderModal({ order, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [executors, setExecutors] = useState([]);
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    furniture_type: '',
    amount: '',
    wishes: '',
    executor_id: ''
  });
  const [files, setFiles] = useState([]);

  // Заполняем форму текущими данными заказа и грузим исполнителей
  useEffect(() => {
    if (order) {
      setFormData({
        client_name: order.client_name || '',
        client_phone: order.client_phone || '',
        furniture_type: order.furniture_type || '',
        amount: order.amount || '',
        wishes: order.wishes || '',
        executor_id: order.executor_id || ''
      });
    }
    
    supabase.from('executors').select('*').then(({ data }) => setExecutors(data || []));
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImages = order.reference_images || [];

      // Если добавили новые картинки
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
        reference_images: finalImages
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', order.id)
        .select();

      if (error) throw error;
      
      onUpdate(data[0]); // Обновляем карточку на экране
      onClose();
    } catch (error) {
      alert('Ошибка при обновлении: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-cherry">✏️ Редактировать заказ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-cherry text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Имя клиента *</label>
            <input required type="text" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Телефон</label>
              <input type="text" value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Бюджет (₽)</label>
              <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Тип мебели</label>
            <input type="text" value={formData.furniture_type} onChange={e => setFormData({...formData, furniture_type: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Исполнитель</label>
            <select value={formData.executor_id} onChange={e => setFormData({...formData, executor_id: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg text-gray-700 outline-none focus:border-matcha-dark">
              <option value="">-- Не назначен --</option>
              {executors.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Пожелания клиента</label>
            <textarea rows="3" value={formData.wishes} onChange={e => setFormData({...formData, wishes: e.target.value})} className="w-full border border-matcha-border p-2 rounded-lg outline-none focus:border-matcha-dark"></textarea>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Добавить новые скриншоты</label>
            <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="w-full text-sm" />
            {order.reference_images && order.reference_images.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Уже прикреплено фото: {order.reference_images.length}</p>
            )}
          </div>

          <div className="pt-2 flex gap-2">
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