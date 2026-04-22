import React, { useState, useEffect } from 'react';
import { UploadCloud, Edit, Trash2 } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manage'
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Management State
  const [photos, setPhotos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', description: '' });
  const [previewImage, setPreviewImage] = useState(null);

  const token = localStorage.getItem('token');

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_CATALOG_URL}/api/catalog/photos`);
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchPhotos();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Selecciona una foto');

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('photo', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_CATALOG_URL}/api/catalog/photos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
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
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta fotografía?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_CATALOG_URL}/api/catalog/photos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPhotos();
    } catch (err) {
      alert('Error eliminando fotografía');
    }
  };

  const handleEditClick = (photo) => {
    setEditingId(photo.id);
    setEditForm({ title: photo.title, price: photo.price, description: photo.description || '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_CATALOG_URL}/api/catalog/photos/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingId(null);
        fetchPhotos();
      }
    } catch (err) {
      alert('Error actualizando fotografía');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Panel de Control</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Cerrar Sesión</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('upload')}
        >
          Subir Fotografía
        </button>
        <button 
          className={`btn ${activeTab === 'manage' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('manage')}
        >
          Gestionar Catálogo
        </button>
      </div>

      {activeTab === 'upload' && (
        <div className="glass" style={{ padding: '3rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Nueva Fotografía (Crear)</h2>
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
                El servidor aplicará una marca de agua en el centro y reducirá la resolución automáticamente para la vista pública.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Título</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Precio (USD)</label>
                <input type="number" step="0.01" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
            </div>
            
            <div className="form-group">
              <label>Descripción</label>
              <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              {loading ? 'Procesando marca de agua y subiendo...' : 'Publicar Fotografía'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="glass" style={{ padding: '3rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Gestión de Fotografías (RUD)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {photos.map(photo => (
              <div key={photo.id} style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '12px', alignItems: 'center' }}>
                <img 
                  src={photo.watermarkedUrl} 
                  alt="preview" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in' }} 
                  onClick={() => setPreviewImage(photo.watermarkedUrl)}
                  title="Haz clic para ampliar"
                />
                
                {editingId === photo.id ? (
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 100px 2fr', gap: '1rem' }}>
                    <input type="text" className="form-control" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                    <input type="number" className="form-control" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                    <input type="text" className="form-control" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{photo.title}</h3>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>${photo.price}</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{photo.description}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {editingId === photo.id ? (
                    <>
                      <button className="btn btn-primary" onClick={() => handleSaveEdit(photo.id)} style={{ padding: '0.5rem 1rem' }}>Guardar</button>
                      <button className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary" onClick={() => handleEditClick(photo)} title="Editar">
                        <Edit size={18} />
                      </button>
                      <button className="btn btn-secondary" onClick={() => handleDelete(photo.id)} style={{ color: 'var(--danger)' }} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {photos.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No has subido ninguna fotografía aún.</p>}
          </div>
        </div>
      )}

      {previewImage && (
        <div className="image-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={previewImage} alt="preview" className="image-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
            <button className="btn btn-secondary" style={{ position: 'absolute', top: '-3rem', right: '0' }} onClick={() => setPreviewImage(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
