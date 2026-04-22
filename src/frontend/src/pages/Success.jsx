import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [error, setError] = useState('');
  const { clearCart } = useCart();

  useEffect(() => {
    if (sessionId) {
      clearCart(); // Empty cart since checkout was successful
      
      // Small delay to allow Stripe Webhook to process the completed status
      setTimeout(() => {
        fetch(`http://localhost:3003/api/payment/download/${sessionId}`)
          .then(res => res.json())
          .then(data => {
            if (data.downloadLinks) {
              setDownloadLinks(data.downloadLinks);
            } else {
              setError('No se pudo generar el enlace de descarga o el pago aún se está procesando.');
            }
          })
          .catch(err => setError('Error de conexión al verificar el pago.'));
      }, 3000);
    }
  }, [sessionId]);

  return (
    <div className="success-container animate-fade-in">
      <div className="glass" style={{ padding: '4rem 2rem' }}>
        <CheckCircle className="success-icon" style={{ width: '80px', height: '80px', color: '#10b981', margin: '0 auto 1.5rem', display: 'block' }} />
        <h1 style={{ marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Gracias por tu compra. Tus fotografías en alta resolución están listas.
          Los siguientes enlaces serán válidos únicamente por 24 horas.
        </p>

        {downloadLinks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
            {downloadLinks.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '1rem' }}>
                <span>{link.title}</span>
                <Download size={20} />
              </a>
            ))}
          </div>
        ) : error ? (
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        ) : (
          <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Verificando pago y preparando tus archivos...</p>
        )}

        <div style={{ marginTop: '3rem' }}>
          <Link to="/" className="btn btn-secondary">Volver a la Galería</Link>
        </div>
      </div>
    </div>
  );
}
