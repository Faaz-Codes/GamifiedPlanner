import { useState } from 'react';

function TaskManager({ tasks, onAddTask, onCompleteTask }) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('easy');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onAddTask(cleanTitle, difficulty);
    setTitle('');
    setDifficulty('easy');
  };

  return (
    <section className="card panel">
      <div className="panel-header">
        <h2>Tasks</h2>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a study task"
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button type="submit">Add</button>
      </form>

      <ul className="task-list">
        {tasks.length === 0 ? <li className="empty-state">No tasks yet. Add your first study target.</li> : null}
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'done' : ''}`}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onCompleteTask(task.id)}
                disabled={task.completed}
              />
              <span>{task.title}</span>
            </label>
            <small className={`difficulty ${task.difficulty}`}>{task.difficulty}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TaskManager;
