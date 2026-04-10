import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import PostcardCard from './components/PostcardCard';
import CollectionPage from './components/CollectionPage';
import Pomodoro from './components/Pomodoro';
import spiderman from './assets/postcards/spiderman.svg';
import batman from './assets/postcards/batman.svg';
import venom from './assets/postcards/venom.svg';
import redbatman from './assets/postcards/redbatman.svg';

const STORAGE_KEY = 'gamifiedPlannerData';
const MS_IN_DAY = 1000 * 60 * 60 * 24;
const XP_PER_LEVEL = 100;

const DEFAULT_POSTCARDS = [
  {
    id: 1,
    title: 'Spider-Man',
    image: spiderman,
    totalPieces: 8,
    unlockedPieces: 0,
    completed: false
  },
  {
    id: 2,
    title: 'Batman',
    image: batman,
    totalPieces: 8,
    unlockedPieces: 0,
    completed: false
  },
  {
    id: 3,
    title: 'Venom',
    image: venom,
    totalPieces: 8,
    unlockedPieces: 0,
    completed: false
  },
  {
    id: 4,
    title: 'Red Batman',
    image: redbatman,
    totalPieces: 8,
    unlockedPieces: 0,
    completed: false
  }
];

const mergePostcardImages = (savedPostcards) => {
  if (!Array.isArray(savedPostcards) || !savedPostcards.length) return DEFAULT_POSTCARDS;

  return savedPostcards.map((postcard, index) => {
    const defaultPostcard =
      DEFAULT_POSTCARDS.find((item) => item.id === postcard.id || item.title === postcard.title) ||
      DEFAULT_POSTCARDS[index];

    return {
      ...postcard,
      image: defaultPostcard?.image ?? postcard.image
    };
  });
};

const getSavedData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
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
  const [tasks, setTasks] = useState(() => {
    const saved = getSavedData();
    return Array.isArray(saved.tasks) ? saved.tasks.map((task) => ({ ...task, isDeleting: false })) : [];
  });
  const [xp, setXp] = useState(() => {
    const saved = getSavedData();
    return saved.xp ?? 0;
  });
  const [streak, setStreak] = useState(() => {
    const saved = getSavedData();
    return saved.streak ?? 0;
  });
  const [postcards, setPostcards] = useState(() => {
    const saved = getSavedData();
    return mergePostcardImages(saved.postcards);
  });
  const [lastCompletedDate, setLastCompletedDate] = useState(() => {
    const saved = getSavedData();
    return saved.lastCompletedDate ?? null;
  });
  const [xpPopup, setXpPopup] = useState(null);
  const [highlightedPostcardId, setHighlightedPostcardId] = useState(null);
  const [page, setPage] = useState('tasks');
  const activePostcard = useMemo(() => postcards.find((postcard) => !postcard.completed), [postcards]);

  useEffect(() => {
    const data = {
      tasks,
      xp,
      streak,
      postcards,
      lastCompletedDate
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [tasks, xp, streak, postcards, lastCompletedDate]);

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

  const level = useMemo(() => Math.floor(xp / XP_PER_LEVEL) + 1, [xp]);
  const xpProgress = useMemo(() => xp % XP_PER_LEVEL, [xp]);

  const addTask = (title, difficulty) => {
    const task = {
      id: crypto.randomUUID(),
      title,
      difficulty,
      completed: false,
      isDeleting: false
    };

    setTasks((prev) => [task, ...prev]);
  };

  const completeTask = (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.completed || task.isDeleting) return;

    const gainedXP = calculateXP(task.difficulty);
    const nowIso = new Date().toISOString();
    const streakResult = updateStreak(lastCompletedDate, nowIso);

    setXp((prev) => prev + gainedXP);

    if (streakResult.streak === 1) {
      setStreak(1);
    } else if (streakResult.streak === 'increment') {
      setStreak((prev) => prev + 1);
    }

    if (streakResult.saveDate) {
      setLastCompletedDate(nowIso);
    }

    if (streakResult.unlockedToday) {
      const unlockResult = unlockPostcardPiece(postcards);
      setPostcards(unlockResult.postcards);
      if (unlockResult.unlockedCardId) setHighlightedPostcardId(unlockResult.unlockedCardId);
    }

    setXpPopup(`+${gainedXP} XP`);

    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId
          ? {
              ...item,
              completed: true,
              isDeleting: true
            }
          : item
      )
    );

    setTimeout(() => {
      setTasks((prev) => prev.filter((savedTask) => savedTask.id !== taskId));
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
          <Dashboard xp={xp} level={level} streak={streak} xpProgress={xpProgress} />

          <main className="main-content">
            <TaskManager tasks={tasks} onAddTask={addTask} onCompleteTask={completeTask} />
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
                    showLarge
                  />
                </div>
              ) : (
                <p className="empty-state">You have completed all postcards. Amazing consistency!</p>
              )}
            </section>
          </main>
        </>
      )}

      {page === 'collection' && (
        <CollectionPage
          postcards={postcards}
          onBack={() => setPage('tasks')}
          highlightedPostcardId={highlightedPostcardId}
        />
      )}

      {page === 'pomodoro' && <Pomodoro onBack={() => setPage('tasks')} />}

      {xpPopup && <div className="xp-popup">{xpPopup}</div>}
    </div>
  );
}

export default App;
