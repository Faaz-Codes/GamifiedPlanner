import { useEffect, useState } from 'react';

const BREAK_MINUTES = 5;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function Pomodoro() {
  const [duration, setDuration] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 0) {
          let nextSeconds = duration * 60;

          setIsBreak((prevIsBreak) => {
            const nextIsBreak = !prevIsBreak;
            nextSeconds = nextIsBreak ? BREAK_MINUTES * 60 : duration * 60;
            return nextIsBreak;
          });

          return nextSeconds;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, duration]);

  const handleDurationChange = (value) => {
    setDuration(value);
    if (!isBreak) {
      setTimeLeft(value * 60);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(duration * 60);
  };

  return (
    <section className="card pomodoro">
      <h2>Pomodoro Timer</h2>

      <div className="options">
        {[10, 20, 30].map((value) => (
          <button
            key={value}
            className={duration === value ? 'active-option' : ''}
            onClick={() => handleDurationChange(value)}
            type="button"
          >
            {value} min
          </button>
        ))}
      </div>

      <div className="timer">{formatTime(timeLeft)}</div>

      <div className="controls">
        <button onClick={() => setIsRunning(true)} type="button">
          Start
        </button>
        <button onClick={() => setIsRunning(false)} type="button">
          Pause
        </button>
        <button onClick={resetTimer} type="button">
          Reset
        </button>
      </div>

      <p>{isBreak ? 'Break Time ☕' : 'Study Time 📚'}</p>
    </section>
  );
}

export default Pomodoro;
