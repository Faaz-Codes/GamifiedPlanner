import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateXP, unlockPostcardPiece, updateStreak, XP_PER_LEVEL } from './lib/planner';
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
  return DEFAULT_POSTCARDS.map((defaultPostcard) => {
    const savedPostcard = Array.isArray(savedPostcards)
      ? savedPostcards.find(
          (postcard) => postcard?.id === defaultPostcard.id || postcard?.title === defaultPostcard.title
        )
      : null;
    const unlockedPieces = Math.min(
      defaultPostcard.totalPieces,
      Math.max(0, Number.isInteger(savedPostcard?.unlockedPieces) ? savedPostcard.unlockedPieces : 0)
    );

    return {
      ...defaultPostcard,
      unlockedPieces,
      completed: unlockedPieces === defaultPostcard.totalPieces
    };
  });
};

const getSavedData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

function App() {
  const [savedData] = useState(getSavedData);
  const [tasks, setTasks] = useState(() => {
    if (!Array.isArray(savedData.tasks)) return [];
    return savedData.tasks
      .filter((task) => typeof task?.id === 'string' && typeof task.title === 'string' && task.title.trim())
      .map((task) => ({
        id: task.id,
        title: task.title.trim().slice(0, 160),
        difficulty: ['easy', 'medium', 'hard'].includes(task.difficulty) ? task.difficulty : 'easy',
        completed: false,
        isDeleting: false
      }));
  });
  const [xp, setXp] = useState(() => (Number.isFinite(savedData.xp) && savedData.xp >= 0 ? savedData.xp : 0));
  const [streak, setStreak] = useState(() =>
    Number.isInteger(savedData.streak) && savedData.streak >= 0 ? savedData.streak : 0
  );
  const [postcards, setPostcards] = useState(() => mergePostcardImages(savedData.postcards));
  const [lastCompletedDate, setLastCompletedDate] = useState(() =>
    typeof savedData.lastCompletedDate === 'string' ? savedData.lastCompletedDate : null
  );
  const lastCompletedDateRef = useRef(lastCompletedDate);
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

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Keep the current session usable when storage is unavailable or full.
    }
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
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
    const streakResult = updateStreak(lastCompletedDateRef.current, nowIso);

    setXp((prev) => prev + gainedXP);

    if (streakResult.streak === 1) {
      setStreak(1);
    } else if (streakResult.streak === 'increment') {
      setStreak((prev) => prev + 1);
    }

    if (streakResult.saveDate) {
      lastCompletedDateRef.current = nowIso;
      setLastCompletedDate(nowIso);
    }

    if (streakResult.unlockedToday) {
      setPostcards((previousPostcards) => {
        const unlockResult = unlockPostcardPiece(previousPostcards);
        if (unlockResult.unlockedCardId) setHighlightedPostcardId(unlockResult.unlockedCardId);
        return unlockResult.postcards;
      });
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
