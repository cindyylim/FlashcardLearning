import React, { useState } from 'react';
import { apiRequest } from './api.ts';
import { useAuth } from './AuthContext.tsx';

const ImportExportPage: React.FC = () => {
  const { token } = useAuth();
  const [deckName, setDeckName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [deckNameExport, setDeckNameExport] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!file) return setError('No file selected');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deckName', deckName);
    try {
      const res = await fetch('/api/csv/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).message || res.statusText);
      setSuccess('Deck imported successfully!');
      setDeckName('');
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const deckId = await apiRequest(`/decks/id-from-name?name=${deckNameExport}`, {}, token!);
      const res = await fetch(`http://localhost:8080/api/csv/export/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deck-${deckId}.csv`;
      a.click();
      setSuccess('Deck exported successfully!');
    } catch (err: any) {
      if (err.message.includes("Forbidden")){
        setError("Invalid deck name")
      }else {
        setError(err.message);
      }
    }
  };

  return (
    <div>
      <div className="header">
        <div className="container">
          <h1>Import & Export</h1>
        </div>
      </div>

      <div className="container">
        <div className="grid">
          <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Import Deck</h2>
            <p style={{ color: '#586380', marginBottom: '24px' }}>
              Upload a CSV file to import flashcards into a new deck.
            </p>
            <form onSubmit={handleImport}>
              <div className="form-group">
                <label htmlFor="import-deck-name">Deck Name</label>
                <input
                  id="import-deck-name"
                  type="text"
                  className="input"
                  placeholder="Enter deck name"
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="csv-file">CSV File</label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  className="input"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  required
                  style={{ padding: '8px' }}
                />
              </div>
              <button type="submit" className="btn">
                Import Deck
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Export Deck</h2>
            <p style={{ color: '#586380', marginBottom: '24px' }}>
              Export a deck as a CSV file for backup or sharing.
            </p>
            <form onSubmit={handleExport}>
              <div className="form-group">
                <label htmlFor="export-deck-name">Deck Name</label>
                <input
                  id="export-deck-name"
                  type="text"
                  className="input"
                  placeholder="Enter deck name to export"
                  value={deckNameExport}
                  onChange={e => setDeckNameExport(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn">
                Export Deck
              </button>
            </form>
          </div>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <div className="card" style={{ marginTop: '32px' }}>
          <h3 style={{ marginTop: 0 }}>CSV Format</h3>
          <p style={{ color: '#586380', marginBottom: '16px' }}>
            CSV files should have two columns: question and answer. The first row can be headers.
          </p>
          <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
            Question,Answer<br/>
            What is the capital of France?,Paris<br/>
            What is 2+2?,4<br/>
            Who wrote Romeo and Juliet?,William Shakespeare
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportPage; 