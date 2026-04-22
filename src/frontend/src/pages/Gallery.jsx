import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3002/api/catalog/photos')
      .then(res => res.json())
      .then(data => setPhotos(data))
      .catch(err => console.error(err));
  }, []);

  const buyPhoto = async (photoId) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3003/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Error al procesar el pago");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Últimas Fotografías</h1>
      <div className="gallery-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-card glass-card">
            <img src={photo.watermarkedUrl} alt={photo.title} className="photo-img" />
            <div className="photo-overlay">
              <div className="photo-info">
                <h3>{photo.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{photo.description}</p>
              </div>
              <button 
                onClick={() => buyPhoto(photo.id)} 
                className="btn btn-primary" 
                disabled={loading}
              >
                <ShoppingBag size={20} />
                <span className="photo-price">${photo.price}</span>
              </button>
            </div>
          </div>
        ))}
        {photos.length === 0 && <p style={{textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-muted)'}}>Aún no hay fotografías disponibles en la tienda.</p>}
      </div>
    </div>
  );
}
