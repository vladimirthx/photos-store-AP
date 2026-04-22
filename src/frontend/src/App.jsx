import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Success from './pages/Success';

function App() {
  const isAdminLoggedIn = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <nav className="navbar glass">
        <div className="navbar-brand">
          <Link to="/">Aura Photography</Link>
        </div>
        <div className="nav-links">
          <Link to="/">Store</Link>
          {isAdminLoggedIn ? (
            <Link to="/admin" style={{ color: 'var(--accent)' }}>Panel de Control</Link>
          ) : (
            <Link to="/login">Admin Login</Link>
          )}
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
