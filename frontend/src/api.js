/**
 * API client service for communicating with the FastAPI backend.
 * Uses relative URL '/api' which is forwarded to http://localhost:8000 via Vite's proxy.
 */

const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `HTTP error! Status: ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.detail) {
        if (typeof data.detail === 'string') {
          errorDetail = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorDetail = data.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        }
      } else if (data && data.error) {
        errorDetail = data.error;
      }
    } catch (_) {
      // Non-JSON response body
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export const api = {
  /**
   * Health check endpoint verifying database connectivity
   */
  async checkHealth() {
    const response = await fetch(`${API_BASE}/health`);
    return handleResponse(response);
  },

  /**
   * Fetch all tasks with optional status and search filters
   */
  async getTasks(status = 'all', search = '') {
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.append('status', status);
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/tasks${query}`);
    return handleResponse(response);
  },

  /**
   * Fetch task count statistics
   */
  async getTaskCounts() {
    const response = await fetch(`${API_BASE}/tasks/counts`);
    return handleResponse(response);
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  /**
   * Get a single task by ID
   */
  async getTask(taskId) {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`);
    return handleResponse(response);
  },

  /**
   * Update task fields (title, description, completed)
   */
  async updateTask(taskId, updateData) {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  },

  /**
   * Delete a task by ID
   */
  async deleteTask(taskId) {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
