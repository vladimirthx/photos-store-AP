import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Success from './pages/Success';
import { CartProvider, useCart } from './context/CartContext';
import { ShoppingCart, X } from 'lucide-react';

const Navbar = () => {
  const { cart, toggleCart, isCartOpen, removeFromCart } = useCart();
  const isAdminLoggedIn = !!localStorage.getItem('token');

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PAYMENT_URL}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: cart.map(c => c.id) })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Error procesando el pago");
    }
  };

  return (
    <>
      <nav className="navbar glass">
        <div className="navbar-brand">
          <Link to="/">Angel Perez</Link>
        </div>
        <div className="nav-links">
          <Link to="/">Store</Link>
          {isAdminLoggedIn ? (
            <Link to="/admin" style={{ color: 'var(--accent)' }}>Panel de Control</Link>
          ) : (
            <Link to="/login">Admin Login</Link>
          )}
          <button onClick={toggleCart} style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' }}>
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={toggleCart}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Tu Carrito</h2>
          <button onClick={toggleCart} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>El carrito está vacío</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.watermarkedUrl} alt={item.title} />
                <div style={{ flex: 1 }}>
                  <h4>{item.title}</h4>
                  <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>${item.price}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%' }}>Pagar Todo</button>
          </div>
        )}
      </div>
    </>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
