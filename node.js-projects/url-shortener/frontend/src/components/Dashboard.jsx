import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link, Trash2, LogOut, BarChart2 } from 'lucide-react';
import CreateUrl from './CreateUrl';
import './Dashboard.css';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://xenacious-devina-jaffdavy-de32cf3b.koyeb.app/api/my-urls', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }

      const data = await response.json();
      setUrls(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URLs');
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleDelete = async (shortCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://xenacious-devina-jaffdavy-de32cf3b.koyeb.app/api/url/${shortCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }

      setUrls(urls.filter(url => url.shortCode !== shortCode));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete URL');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>URL Shortener Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-logout">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <CreateUrl />

        <div className="urls-section">
          <h2>Your Short URLs</h2>
          {error && <div className="error">{error}</div>}
          <div className="urls-grid">
            {urls.map(url => (
              <div key={url.id} className="url-card">
                <div className="url-info">
                  <h3>
                    <Link size={20} />
                    {url.shortCode}
                  </h3>
                  <p className="long-url" title={url.longUrl}>
                    {url.longUrl}
                  </p>
                  <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
                    {url.shortUrl}
                  </a>
                </div>
                <div className="url-stats">
                  <div className="stat">
                    <BarChart2 size={16} />
                    <span>{url.clicks} clicks</span>
                  </div>
                  {url.expiresAt && (
                    <div className="stat">
                      <span>Expires: {new Date(url.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="url-actions">
                  <button
                    onClick={() => handleDelete(url.shortCode)}
                    className="btn btn-delete"
                    title="Delete URL"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;