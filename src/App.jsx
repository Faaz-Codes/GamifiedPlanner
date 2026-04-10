import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import PostcardCard from './components/PostcardCard';
import CollectionPage from './components/CollectionPage';
import Pomodoro from './components/Pomodoro';

const STORAGE_KEY = 'gamifiedPlannerData';
const MS_IN_DAY = 1000 * 60 * 60 * 24;
const XP_PER_LEVEL = 100;

const basePostcards = [
  {
    id: 'aurora',
    title: 'Aurora Journey',
    totalPieces: 4,
    unlockedPieces: 0,
    completed: false,
    imageUrl:
      'https://images.unsplash.com/photo-1579038773867-044c48829161?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'alps',
    title: 'Alpine Morning',
    totalPieces: 6,
    unlockedPieces: 0,
    completed: false,
    imageUrl:
      'https://images.unsplash.com/photo-1508261305437-4ea70b6f0f94?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tokyo',
    title: 'Tokyo Twilight',
    totalPieces: 8,
    unlockedPieces: 0,
    completed: false,
    imageUrl:
      'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=1200&q=80'
  }
];

const initialState = {
  user: {
    xp: 0,
    streak: 0,
    lastCompletedDate: null
  },
  tasks: [],
  postcards: basePostcards
};

const calculateXP = (difficulty) => {
  if (difficulty === 'easy') return 10;
  if (difficulty === 'medium') return 20;
  return 30;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const updateStreak = (lastCompletedDate, completionDate) => {
  if (!lastCompletedDate) {
    return { streak: 1, unlockedToday: true, saveDate: true };
  }

  const prev = normalizeDate(lastCompletedDate);
  const next = normalizeDate(completionDate);
  const daysDiff = Math.floor((next - prev) / MS_IN_DAY);

  if (daysDiff === 0) {
    return { streak: null, unlockedToday: false, saveDate: false };
  }

  if (daysDiff === 1) {
    return { streak: 'increment', unlockedToday: true, saveDate: true };
  }

  if (daysDiff > 1) {
    return { streak: 1, unlockedToday: true, saveDate: true };
  }

  return { streak: null, unlockedToday: false, saveDate: false };
};

const unlockPostcardPiece = (postcards) => {
  const next = postcards.map((postcard) => ({ ...postcard }));
  const target = next.find((item) => !item.completed && item.unlockedPieces < item.totalPieces);

  if (!target) {
    return { postcards: next, unlockedCardId: null, pieceUnlocked: false };
  }

  target.unlockedPieces += 1;
  target.completed = target.unlockedPieces >= target.totalPieces;

  return {
    postcards: next,
    unlockedCardId: target.id,
    pieceUnlocked: true
  };
};

function App() {
  const [state, setState] = useState(initialState);
  const [xpPopup, setXpPopup] = useState(null);
  const [highlightedPostcardId, setHighlightedPostcardId] = useState(null);
  const [page, setPage] = useState('tasks');
  const activePostcard = useMemo(() => state.postcards.find((postcard) => !postcard.completed), [state.postcards]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setState({
        user: {
          xp: parsed?.user?.xp ?? 0,
          streak: parsed?.user?.streak ?? 0,
          lastCompletedDate: parsed?.user?.lastCompletedDate ?? null
        },
        tasks: Array.isArray(parsed?.tasks)
          ? parsed.tasks.map((task) => ({ ...task, isDeleting: false }))
          : [],
        postcards:
          Array.isArray(parsed?.postcards) && parsed.postcards.length
            ? parsed.postcards
            : basePostcards
      });
    } catch (error) {
      console.error('Could not parse localStorage data', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!xpPopup) return;
    const timeout = setTimeout(() => setXpPopup(null), 1600);
    return () => clearTimeout(timeout);
  }, [xpPopup]);

  useEffect(() => {
    if (!highlightedPostcardId) return;
    const timeout = setTimeout(() => setHighlightedPostcardId(null), 1800);
    return () => clearTimeout(timeout);
  }, [highlightedPostcardId]);

  const level = useMemo(() => Math.floor(state.user.xp / XP_PER_LEVEL) + 1, [state.user.xp]);
  const xpProgress = useMemo(() => state.user.xp % XP_PER_LEVEL, [state.user.xp]);

  const addTask = (title, difficulty) => {
    const task = {
      id: crypto.randomUUID(),
      title,
      difficulty,
      completed: false,
      isDeleting: false
    };

    setState((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks]
    }));
  };

  const completeTask = (taskId) => {
    setState((prev) => {
      const task = prev.tasks.find((item) => item.id === taskId);
      if (!task || task.completed || task.isDeleting) return prev;

      const gainedXP = calculateXP(task.difficulty);
      const nowIso = new Date().toISOString();
      const streakResult = updateStreak(prev.user.lastCompletedDate, nowIso);

      let nextStreak = prev.user.streak;
      if (streakResult.streak === 1) nextStreak = 1;
      if (streakResult.streak === 'increment') nextStreak = prev.user.streak + 1;

      let postcards = prev.postcards;
      let unlockedCardId = null;

      if (streakResult.unlockedToday) {
        const unlockResult = unlockPostcardPiece(prev.postcards);
        postcards = unlockResult.postcards;
        unlockedCardId = unlockResult.unlockedCardId;
      }

      setXpPopup(`+${gainedXP} XP`);
      if (unlockedCardId) setHighlightedPostcardId(unlockedCardId);

      return {
        ...prev,
        user: {
          xp: prev.user.xp + gainedXP,
          streak: nextStreak,
          lastCompletedDate: streakResult.saveDate ? nowIso : prev.user.lastCompletedDate
        },
        tasks: prev.tasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                completed: true,
                isDeleting: true
              }
            : item
        ),
        postcards
      };
    });

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== taskId)
      }));
    }, 300);
  };

  return (
    <div className="container">
      <header className="hero">
        <div className="header">
          <h1>Gamified Study Planner</h1>
          <div className="nav-buttons">
            <button className={page === 'tasks' ? 'active' : ''} onClick={() => setPage('tasks')} type="button">
              Tasks
            </button>
            <button className={page === 'pomodoro' ? 'active' : ''} onClick={() => setPage('pomodoro')} type="button">
              Pomodoro
            </button>
          </div>
        </div>
        <p>Build momentum daily. Earn XP, keep your streak, and reveal postcards one piece at a time.</p>
      </header>

      {page === 'tasks' && (
        <>
          <Dashboard xp={state.user.xp} level={level} streak={state.user.streak} xpProgress={xpProgress} />

          <main className="main-content">
            <TaskManager tasks={state.tasks} onAddTask={addTask} onCompleteTask={completeTask} />
            <section className="card panel postcard-section">
              <div className="postcard-header">
                <h2>Postcards</h2>
                <button onClick={() => setPage('collection')} type="button">
                  View Collection
                </button>
              </div>

              {activePostcard ? (
                <div className="postcard-active">
                  <PostcardCard
                    postcard={activePostcard}
                    highlighted={highlightedPostcardId === activePostcard.id}
                  />
                </div>
              ) : (
                <p className="empty-state">All postcards completed 🎉</p>
              )}
            </section>
          </main>
        </>
      )}

      {page === 'pomodoro' && <Pomodoro />}

      {page === 'collection' && <CollectionPage postcards={state.postcards} setPage={setPage} />}

      {xpPopup ? <div className="xp-popup">{xpPopup}</div> : null}
    </div>
  );
}

export default App;
export { calculateXP, updateStreak, unlockPostcardPiece };
