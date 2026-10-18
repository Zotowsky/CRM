import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [executors, setExecutors] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const loadExecutors = async () => {
    const { data } = await supabase.from('executors').select('*').order('created_at');
    if (data) setExecutors(data);
  };

  useEffect(() => { loadExecutors(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !email) return;
    
    const { error } = await supabase.from('executors').insert([{ name, email }]);
    if (error) alert('Ошибка: ' + error.message);
    else {
      setName(''); setEmail('');
      loadExecutors();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-matcha-border mb-6">
      <h2 className="text-xl font-bold mb-4 text-cherry">👑 Управление исполнителями</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input required type="text" placeholder="Имя исполнителя" value={name} onChange={e => setName(e.target.value)} className="border border-matcha-border p-2 rounded-lg flex-1 outline-none focus:border-matcha-dark" />
        <input required type="email" placeholder="Email (для входа)" value={email} onChange={e => setEmail(e.target.value)} className="border border-matcha-border p-2 rounded-lg flex-1 outline-none focus:border-matcha-dark" />
        <button type="submit" className="bg-cherry text-white px-6 rounded-lg hover:bg-[#4a041b] transition font-medium">Добавить</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {executors.map(ex => (
          <span key={ex.id} className="bg-matcha-light text-matcha-dark px-3 py-1 rounded-full text-sm border border-matcha font-medium">
            {ex.name} <span className="text-gray-500 font-normal">({ex.email})</span>
          </span>
        ))}
      </div>
    </div>
  );
}