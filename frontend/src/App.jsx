import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';
import { api } from './api';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, completed: 0 });
  const [dbStatus, setDbStatus] = useState({ status: 'unknown', database: 'checking' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Check health of backend & database
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.checkHealth();
      setDbStatus(data);
    } catch (err) {
      setDbStatus({
        status: 'unhealthy',
        database: 'disconnected',
        error: err.message,
      });
    }
  }, []);

  // Fetch counts
  const fetchCounts = useCallback(async () => {
    try {
      const data = await api.getTaskCounts();
      setCounts(data);
    } catch (_) {
      // Fallback: compute from tasks
    }
  }, []);

  // Fetch tasks with current filter and search
  const fetchTasks = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(activeFilter, searchQuery);
      setTasks(data);
      await fetchCounts();
      await checkHealth();
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
      showToast(err.message || 'Failed to load tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, searchQuery, fetchCounts, checkHealth, showToast]);

  // Initial load
  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  // Periodic health check
  useEffect(() => {
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Handle task creation
  const handleCreateTask = async (taskData) => {
    setIsCreating(true);
    try {
      const newTask = await api.createTask(taskData);
      showToast(`Task "${newTask.title}" created successfully!`, 'success');
      await fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Handle toggle complete / pending
  const handleToggleComplete = async (task) => {
    const updatedStatus = !task.completed;
    try {
      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t))
      );
      await api.updateTask(task.id, { completed: updatedStatus });
      showToast(
        updatedStatus ? `Task marked as completed!` : `Task marked as pending!`,
        'success'
      );
      await fetchCounts();
    } catch (err) {
      // Rollback on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
      showToast(err.message || 'Failed to update task status', 'error');
    }
  };

  // Handle edit task save
  const handleSaveEdit = async (taskId, updatedData) => {
    setIsSavingEdit(true);
    try {
      const updated = await api.updateTask(taskId, updatedData);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast('Task updated successfully!', 'success');
      setEditingTask(null);
      await fetchCounts();
    } catch (err) {
      showToast(err.message || 'Failed to save changes', 'error');
      throw err;
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Task deleted successfully', 'success');
      await fetchCounts();
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  return (
    <div className="app-container">
      <Header
        dbStatus={dbStatus}
        onRefresh={() => {
          checkHealth();
          fetchTasks(true);
        }}
      />

      <StatsBar
        counts={counts}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <TaskForm
        onTaskCreated={handleCreateTask}
        isCreating={isCreating}
      />

      <TaskFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onRetry={() => fetchTasks(true)}
        onToggleComplete={handleToggleComplete}
        onEditTask={setEditingTask}
        onDeleteTask={handleDeleteTask}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
      />

      <TaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
