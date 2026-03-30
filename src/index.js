import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminDashboard from './AdminDashboard';
import './index.css';

function Router() {
  const path = window.location.pathname;

  if (path === '/admin') {
    return <AdminDashboard />;
  }

  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
