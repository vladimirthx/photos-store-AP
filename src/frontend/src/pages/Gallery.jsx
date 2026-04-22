import React, { useEffect, useState } from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const { cart, addToCart } = useCart();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_CATALOG_URL}/api/catalog/photos`)
      .then(res => res.json())
      .then(data => setPhotos(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Últimas Fotografías</h1>
      <div className="gallery-grid">
        {photos.map(photo => {
          const inCart = cart.find(item => item.id === photo.id);
          
          return (
            <div key={photo.id} className="photo-card glass-card">
              <img src={photo.watermarkedUrl} alt={photo.title} className="photo-img" />
              <div className="photo-overlay">
                <div className="photo-info">
                  <h3>{photo.title}</h3>
                  <p style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{photo.description}</p>
                </div>
                <button 
                  onClick={() => addToCart(photo)} 
                  className={`btn ${inCart ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={inCart}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {inCart ? <Check size={20} /> : <PlusCircle size={20} />}
                  <span className="photo-price" style={{ color: inCart ? 'var(--text-main)' : 'white', fontSize: '1rem', marginLeft: '0.25rem' }}>
                    ${photo.price}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
        {photos.length === 0 && <p style={{textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-muted)'}}>Aún no hay fotografías disponibles en la tienda.</p>}
      </div>
    </div>
  );
}
