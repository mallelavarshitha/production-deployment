import React, { useState } from 'react';

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggleComplete(task);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDeleteTask(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`task-item-card ${task.completed ? 'task-completed' : ''}`}>
      <div className="task-left">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={isToggling}
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
          />
          <span className="checkbox-custom">
            {task.completed && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </label>

        <div className="task-details">
          <div className="task-title-row">
            <h3 className="task-title">{task.title}</h3>
            <span className={`badge ${task.completed ? 'badge-success' : 'badge-pending'}`}>
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            <span title={`Created at ${formatDate(task.created_at)}`}>
              Created {formatDate(task.created_at)}
            </span>
            {task.updated_at && task.updated_at !== task.created_at && (
              <span className="meta-separator">• Updated {formatDate(task.updated_at)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="btn-action btn-edit"
          onClick={() => onEditTask(task)}
          title="Edit task"
          aria-label={`Edit task "${task.title}"`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>

        <button
          type="button"
          className="btn-action btn-delete"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete task"
          aria-label={`Delete task "${task.title}"`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
