import React, { useState } from 'react';
import { Link } from 'lucide-react';  // Assuming you need this component; otherwise, remove it
import './CreateUrl.css';

const CreateUrl = () => {
  const [formData, setFormData] = useState({
    longUrl: '',
    customCode: '',
    expiresAt: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create short URL');
      }

      setSuccess(`Short URL created: ${data.data.shortUrl}`);
      setFormData({ longUrl: '', customCode: '', expiresAt: '' });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create short URL');
      setSuccess('');
    }
  };

  return (
    <div className="create-url-container">
      <div className="create-url-card">
        <div className="create-url-header">
          <Link size={32} />
          <h2>Create Short URL</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="longUrl">Long URL</label>
            <input
              type="url"
              id="longUrl"
              name="longUrl"
              value={formData.longUrl}
              onChange={handleChange}
              required
              placeholder="https://example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="customCode">Custom Code (Optional)</label>
            <input
              type="text"
              id="customCode"
              name="customCode"
              value={formData.customCode}
              onChange={handleChange}
              placeholder="mycode"
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiresAt">Expiration Date (Optional)</label>
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button type="submit" className="btn btn-primary">
            Create Short URL
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUrl;
