function Dashboard({ xp, level, streak, xpProgress }) {
  return (
    <section className="card dashboard">
      <div className="stat">
        <span className="label">XP</span>
        <strong>{xp}</strong>
      </div>
      <div className="stat">
        <span className="label">Level</span>
        <strong>{level}</strong>
      </div>
      <div className="stat">
        <span className="label">Streak</span>
        <strong>{streak} day{streak === 1 ? '' : 's'}</strong>
      </div>

      <div className="progress-block">
        <div className="progress-meta">
          <span>Progress to next level</span>
          <span>{xpProgress}/100</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
