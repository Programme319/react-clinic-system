import { useEffect, useState } from 'react';
import NurseLayout from '@/Layouts/NurseLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logUpdate, logView } from '@/lib/audit';

export default function NurseTasks() {
  const { authUser } = useAuth();
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    const { data } = await supabase?.from('nurse_tasks').select('*, patients(name)').order('due_at');
    setTasks(data || []);
    await logView(authUser, 'nurse_tasks', 'list');
  };

  useEffect(() => { load(); }, [authUser]);

  const complete = async (id) => {
    await supabase.from('nurse_tasks').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id);
    await logUpdate(authUser, 'nurse_task', id, { status: 'done' });
    load();
  };

  return (
    <NurseLayout title="Task List">
      <div className="panel">
        {tasks.map((t) => (
          <div key={t.id} className="patient-detail__record" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="patient-detail__record-name">{t.title}</p>
              <p className="patient-detail__record-code">{t.patients?.name} · {t.status}</p>
            </div>
            {t.status !== 'done' && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => complete(t.id)}>Done</button>
            )}
          </div>
        ))}
      </div>
    </NurseLayout>
  );
}
