import React, { useState } from 'react';
import Papa from 'papaparse';
import { apiRequest } from './api.ts';
import { useAuth } from './AuthContext.tsx';

interface FlashcardRow {
  id: number;
  question: string;
  answer: string;
  error?: string;
}

const ImportExportPage: React.FC = () => {
  const { token } = useAuth();
  const [deckName, setDeckName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<FlashcardRow[]>([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deckNameExport, setDeckNameExport] = useState('');

  // Handle file selection and parse CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setCsvPreview([]);
    setNextRowId(1);

    if (!selectedFile) return;

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase(),
      complete: (results) => {
        const data = results.data as any[];
        const previewRows: FlashcardRow[] = data
          .filter(row => Object.values(row).some(v => v && v.toString().trim() !== '')) // skip empty rows
          .map((row, idx) => {
            const q = (row['question'] || row['q'] || '').toString().trim();
            const a = (row['answer'] || row['a'] || '').toString().trim();
            const err = (!q || !a) ? 'Missing question or answer' : undefined;
            return { id: idx + 1, question: q, answer: a, error: err };
          });
        setCsvPreview(previewRows);
        setNextRowId(previewRows.length + 1);
      },
      error: (err) => setError(err.message),
    });
  }    

  // Clear messages whenever fields change
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) return setError('No file selected');
    if (!deckName) return setError('Deck name is required');

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
      setCsvPreview([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // -------------------------------
  // EXPORT
  // -------------------------------
  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      const deckId = await apiRequest(`/decks/id-from-name?name=${encodeURIComponent(deckNameExport)}`, {}, token!);
      const res = await fetch(`/api/csv/export/${deckId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text() || res.statusText);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deck-${deckId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccess('Deck exported successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="header">
        <div className="container">
          <h1>Import Deck</h1>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Upload CSV</h2>
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
                onChange={handleFileChange}
                required
              />
            </div>
            <button type="submit" className="btn">Import Deck</button>
          </form>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {/* CSV Preview */}
        {csvPreview.length > 0 && (
          <div className="card" style={{ marginTop: '32px' }}>
            <h3 style={{ marginTop: 0 }}>Preview Flashcards</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map(row => (
                    <tr key={row.id} style={{ backgroundColor: row.error ? '#ffe5e5' : undefined }}>
                      <td>{row.id}</td>
                      <td>{row.question}</td>
                      <td>{row.answer}</td>
                      <td>{row.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    {/* Export */}
    <div className="card" style={{ marginTop: 20 }}>
    <h2>Export Deck</h2>
    <input
      type="text" className="input" placeholder="Deck Name to export"
      value={deckNameExport} onChange={e => setDeckNameExport(e.target.value)}
    />
    <button className="btn" onClick={handleExport}>Export Deck</button>
  </div>

  {error && <div className="message error">{error}</div>}
  {success && <div className="message success">{success}</div>}
</div>
    
  );

};

export default ImportExportPage;
