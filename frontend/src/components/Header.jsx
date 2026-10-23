import React from 'react';

export default function Header({ dbStatus, onRefresh }) {
  const isHealthy = dbStatus.status === 'healthy';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h1 className="brand-title">TaskFlow</h1>
          <p className="brand-subtitle">Project 20: Production Deployment • Python Stack</p>
        </div>
      </div>

      <div className="header-actions">
        <div
          className={`status-pill ${isHealthy ? 'status-healthy' : 'status-unhealthy'}`}
          title={dbStatus.error || (isHealthy ? 'PostgreSQL is connected and healthy' : 'PostgreSQL is disconnected')}
        >
          <span className="status-dot"></span>
          <span className="status-text">
            {isHealthy ? 'PostgreSQL Connected' : 'Database Offline'}
          </span>
        </div>

        <button
          className="btn btn-secondary btn-icon"
          onClick={onRefresh}
          title="Refresh tasks & health status"
          aria-label="Refresh data"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          API Docs ↗
        </a>
      </div>
    </header>
  );
}
