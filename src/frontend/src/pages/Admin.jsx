import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Selecciona una foto');

    setLoading(true);
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('photo', file);

    try {
      const res = await fetch('http://localhost:3002/api/catalog/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        alert('Fotografía subida y publicada con éxito');
        setTitle('');
        setDescription('');
        setPrice('');
        setFile(null);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Panel de Control</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Cerrar Sesión</button>
      </div>

      <div className="glass" style={{ padding: '3rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Subir Nueva Fotografía</h2>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Fotografía de Alta Resolución</label>
            <label className="file-upload-label">
              <UploadCloud size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
              <span style={{ fontWeight: '600', color: file ? 'white' : 'var(--text-muted)' }}>
                {file ? file.name : 'Haz clic para seleccionar o arrastra la imagen aquí'}
              </span>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              El sistema generará automáticamente una versión de baja resolución con marca de agua para la tienda pública.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Título</label>
              <input 
                type="text" 
                className="form-control" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Precio (USD)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-control" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Descripción</label>
            <textarea 
              className="form-control" 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {loading ? 'Subiendo y procesando...' : 'Publicar Fotografía'}
          </button>
        </form>
      </div>
    </div>
  );
}
