import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  isLoading,
  error,
  onRetry,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  activeFilter,
  searchQuery,
}) {
  // Error state
  if (error) {
    return (
      <div className="state-card state-error">
        <div className="state-icon state-icon-error">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 className="state-title">Failed to load tasks</h3>
        <p className="state-description">{error}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="task-skeleton-container">
        {[1, 2, 3].map((n) => (
          <div key={n} className="task-skeleton-card">
            <div className="skeleton-checkbox"></div>
            <div className="skeleton-details">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-desc"></div>
              <div className="skeleton-line skeleton-meta"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    const isFiltered = activeFilter !== 'all' || searchQuery.trim() !== '';

    return (
      <div className="state-card state-empty">
        <div className="state-icon state-icon-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <h3 className="state-title">
          {isFiltered ? 'No matching tasks found' : 'No tasks yet'}
        </h3>
        <p className="state-description">
          {isFiltered
            ? `There are no tasks matching your current filter "${activeFilter}" ${searchQuery ? `or search "${searchQuery}"` : ''}.`
            : 'Get organized! Create your first task using the form above.'}
        </p>
      </div>
    );
  }

  // Tasks list
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
