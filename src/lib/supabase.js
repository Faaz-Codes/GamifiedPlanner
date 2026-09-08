/** Minimal Supabase REST/RPC adapter. It intentionally uses only public browser env vars. */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anonKey);

async function request(path, options = {}) {
  if (!hasSupabase) throw new Error('Supabase is not configured. Start Demo Mode or add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const token = sessionStorage.getItem('gp_access_token') || anonKey;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error((await response.text()) || 'The planner could not reach Supabase.');
  return response.status === 204 ? null : response.json();
}

export const plannerApi = {
  getDashboard: () => request('rpc/get_dashboard', { method: 'POST', body: '{}' }),
  createTask: (task) => request('tasks', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(task) }),
  completeTask: (taskId) => request('rpc/complete_task', { method: 'POST', body: JSON.stringify({ p_task_id: taskId }) }),
  undoTask: (taskId) => request('rpc/undo_task_completion', { method: 'POST', body: JSON.stringify({ p_task_id: taskId }) }),
  completePomodoro: (taskId, startedAt, duration) => request('rpc/complete_pomodoro', { method: 'POST', body: JSON.stringify({ p_task_id: taskId, p_started_at: startedAt, p_duration_minutes: duration }) })
};
