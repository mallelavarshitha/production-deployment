import React, { useState, useEffect } from 'react';

export default function TaskModal({ task, isOpen, onClose, onSave, isSaving }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCompleted(!!task.completed);
      setValidationError('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setValidationError('Title cannot be empty');
      return;
    }

    try {
      await onSave(task.id, {
        title: cleanTitle,
        description: description.trim() || null,
        completed,
      });
      onClose();
    } catch (_) {
      // Handled via toast in App.jsx
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Task</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-title">
                Task Title <span className="required">*</span>
              </label>
              <input
                id="edit-task-title"
                type="text"
                className={`input-field ${validationError ? 'input-error' : ''}`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={isSaving}
                maxLength={255}
                required
              />
              {validationError && <p className="error-message">{validationError}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-description">
                Description
              </label>
              <textarea
                id="edit-task-description"
                className="input-field textarea-field"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                rows={4}
                placeholder="Add more details about this task..."
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  disabled={isSaving}
                />
                <span className="checkbox-text">Mark as Completed</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
