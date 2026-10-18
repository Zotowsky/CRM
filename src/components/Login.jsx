import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let error;

    if (isRegister) {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      if (!error) alert('Аккаунт создан! Теперь вы можете войти.');
    } else {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
      if (!error) onLogin(res.data.user);
    }

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? 'Регистрация' : 'Вход в систему'}
        </h2>
        <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 mb-3 rounded" />
        <input required type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 mb-4 rounded" />
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          {loading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
        </button>
        <p className="text-sm text-center mt-4 text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </p>
      </form>
    </div>
  );
}