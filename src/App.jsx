import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import KanbanBoard from './components/KanbanBoard';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ExecutorDashboard from './components/ExecutorDashboard';

const ADMIN_EMAIL = 'spartazotov@gmail.com'; 

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center text-cherry bg-matcha-light h-screen font-bold text-xl">Загрузка...</div>;
  if (!session) return <Login onLogin={(user) => setSession({ user })} />;

  const userEmail = session.user.email;
  const isAdmin = userEmail === ADMIN_EMAIL;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-matcha-light">
        <div className="bg-cherry text-white p-3 flex justify-between items-center px-8 shadow-md">
          <div className="flex gap-4">
            <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-lg transition font-medium ${viewMode === 'kanban' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Доска заказов</button>
            <button onClick={() => setViewMode('executors')} className={`px-4 py-2 rounded-lg transition font-medium ${viewMode === 'executors' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Исполнители</button>
          </div>
          <button onClick={handleLogout} className="text-sm border border-white/30 px-4 py-1.5 rounded-lg hover:bg-white hover:text-cherry transition">Выйти</button>
        </div>
        
        {viewMode === 'kanban' ? (
          <KanbanBoard />
        ) : (
          <div className="p-6 max-w-7xl mx-auto">
            <AdminPanel />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matcha-light">
      <ExecutorDashboard userEmail={userEmail} onLogout={handleLogout} />
    </div>
  );
}