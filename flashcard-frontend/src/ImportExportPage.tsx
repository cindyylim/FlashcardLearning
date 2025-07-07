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
      setSuccess('Deck imported!');
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
      setSuccess('Deck exported!');
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
      <h2>Import/Export Decks (CSV)</h2>
      <form onSubmit={handleImport}>
        <input type="text" placeholder="Deck name" value={deckName} onChange={e => setDeckName(e.target.value)} required />
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} required />
        <button type="submit">Import Deck</button>
      </form>
      <form onSubmit={handleExport} style={{marginTop: 20}}>
        <input type="text" placeholder="Deck ID to export" value={deckNameExport} onChange={e => setDeckNameExport(e.target.value)} required />
        <button type="submit">Export Deck</button>
      </form>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {success && <div style={{color: 'green'}}>{success}</div>}
    </div>
  );
};

export default ImportExportPage; 