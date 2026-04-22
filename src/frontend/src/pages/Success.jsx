import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      // Small delay to allow Stripe Webhook to process the completed status
      setTimeout(() => {
        fetch(`http://localhost:3003/api/payment/download/${sessionId}`)
          .then(res => res.json())
          .then(data => {
            if (data.downloadUrl) {
              setDownloadUrl(data.downloadUrl);
            } else {
              setError('No se pudo generar el enlace de descarga o el pago aún se está procesando.');
            }
          })
          .catch(err => setError('Error de conexión al verificar el pago.'));
      }, 2000);
    }
  }, [sessionId]);

  return (
    <div className="success-container animate-fade-in">
      <div className="glass" style={{ padding: '4rem 2rem' }}>
        <CheckCircle className="success-icon" />
        <h1 style={{ marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Gracias por tu compra. Tu fotografía en alta resolución está lista.
          El siguiente enlace será válido únicamente por 24 horas.
        </p>

        {downloadUrl ? (
          <a href={downloadUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            <Download size={24} />
            Descargar Fotografía Original
          </a>
        ) : error ? (
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        ) : (
          <p style={{ color: 'var(--accent)' }}>Verificando pago y preparando tu archivo...</p>
        )}

        <div style={{ marginTop: '3rem' }}>
          <Link to="/" className="btn btn-secondary">Volver a la Galería</Link>
        </div>
      </div>
    </div>
  );
}
