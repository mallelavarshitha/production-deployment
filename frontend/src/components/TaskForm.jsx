import React, { useState } from 'react';

export default function TaskForm({ onTaskCreated, isCreating }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setValidationError('Please enter a task title');
      return;
    }

    setValidationError('');
    try {
      await onTaskCreated({
        title: cleanTitle,
        description: description.trim() || null,
      });
      setTitle('');
      setDescription('');
      setIsExpanded(false);
    } catch (_) {
      // Error is handled in App.jsx via toast
    }
  };

  return (
    <div className="task-form-card">
      <div className="task-form-header">
        <h2 className="form-title">Create New Task</h2>
        {!isExpanded && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsExpanded(true)}
          >
            + Add Task
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={isExpanded ? 'form-expanded' : 'form-collapsed'}>
        <div className="form-group">
          <input
            type="text"
            className={`input-field ${validationError ? 'input-error' : ''}`}
            placeholder="What needs to be done? (e.g. Set up CI/CD pipeline)"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError('');
            }}
            onFocus={() => setIsExpanded(true)}
            disabled={isCreating}
            maxLength={255}
          />
          {validationError && <p className="error-message">{validationError}</p>}
        </div>

        {isExpanded && (
          <>
            <div className="form-group">
              <textarea
                className="input-field textarea-field"
                placeholder="Add optional details or description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setValidationError('');
                  setIsExpanded(false);
                }}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCreating || !title.trim()}
              >
                {isCreating ? (
                  <>
                    <span className="spinner-sm"></span>
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
