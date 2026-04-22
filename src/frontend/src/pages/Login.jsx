import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token && data.role === 'ADMIN') {
        localStorage.setItem('token', data.token);
        // Force reload to update navbar
        window.location.href = '/admin';
      } else {
        alert('Credenciales inválidas o no eres administrador');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  return (
    <div className="auth-box glass animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Lock size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
        <h2>Panel de Administrador</h2>
        <p style={{ color: 'var(--text-muted)' }}>Exclusivo para el fotógrafo</p>
      </div>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            className="form-control" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            className="form-control" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Entrar al Panel
        </button>
      </form>
    </div>
  );
}
