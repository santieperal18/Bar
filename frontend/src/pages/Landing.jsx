import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const ESPECIALIDADES = [
  { icon: 'fa-utensils',     titulo: 'Cocina de barrio',   texto: 'Platos caseros y abundantes, hechos al momento con ingredientes frescos del día.' },
  { icon: 'fa-wine-glass-alt', titulo: 'Barra y tragos',   texto: 'Una carta de vinos, cervezas y clásicos de coctelería para acompañar la mesa.' },
  { icon: 'fa-motorcycle',   titulo: 'Delivery propio',     texto: 'Llevamos tu pedido caliente hasta la puerta de tu casa, rápido y sin vueltas.' },
];

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cerrarMenu = () => setMenuOpen(false);

  return (
    <div className="landing" data-bs-theme="light">
      {/* ── Navbar ── */}
      <header className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="lp-container lp-nav-inner">
          <a href="#inicio" className="lp-brand" onClick={cerrarMenu}>
            <span className="lp-brand-icon"><img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="La Esquina" /></span>
            <span className="lp-brand-text">
              <strong>La Esquina</strong>
              <small>Resto Bar</small>
            </span>
          </a>

          <button
            className="lp-burger"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <nav className={`lp-links${menuOpen ? ' open' : ''}`}>
            <a href="#inicio"        onClick={cerrarMenu}>Inicio</a>
            <a href="#nosotros"      onClick={cerrarMenu}>Nosotros</a>
            <a href="#especialidades" onClick={cerrarMenu}>Especialidades</a>
            <a href="#contacto"      onClick={cerrarMenu}>Contacto</a>
            <Link to="/pedidos" className="lp-btn lp-btn-sm" onClick={cerrarMenu}>
              <i className="fas fa-arrow-right-to-bracket"></i> Ingresar al sistema
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero" id="inicio">
        <div className="lp-hero-overlay" />
        <div className="lp-container lp-hero-content">
          <div className="lp-hero-row">
            <div className="lp-hero-text">
              <span className="lp-eyebrow">Bienvenidos a</span>
              <h1 className="lp-hero-title">La Esquina</h1>
              <p className="lp-hero-sub">
                El resto bar del barrio. Buena comida, mejor compañía
                y el sabor de siempre, a la vuelta de tu casa.
              </p>
            </div>

            {/* Cuchillo + tenedor verticales, estáticos, a la derecha (SVG puro) */}
            <div className="lp-cutlery" aria-hidden="true">
              <svg viewBox="0 0 40 120">
                <rect x="11"   y="3" width="3.6" height="33" rx="1.8" />
                <rect x="18.2" y="3" width="3.6" height="33" rx="1.8" />
                <rect x="25.4" y="3" width="3.6" height="33" rx="1.8" />
                <path d="M9.5 33 H30.5 C30.5 45 26.5 53 20 53 C13.5 53 9.5 45 9.5 33 Z" />
                <rect x="16.5" y="50" width="7" height="67" rx="3.5" />
              </svg>
              <svg viewBox="0 0 40 120">
                <path d="M21 3 C29 22 28 44 25 60 L17 60 C15 44 14 22 21 3 Z" />
                <rect x="17.5" y="58" width="7" height="59" rx="3.5" />
              </svg>
            </div>
          </div>
        </div>
        <a href="#nosotros" className="lp-scroll-hint" aria-label="Bajar">
          <i className="fas fa-chevron-down"></i>
        </a>
      </section>

      {/* ── Nosotros ── */}
      <section className="lp-section" id="nosotros">
        <div className="lp-container lp-about">
          <div className="lp-about-img">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
              alt="Mesa servida en La Esquina"
              loading="lazy"
            />
          </div>
          <div className="lp-about-text">
            <span className="lp-eyebrow lp-eyebrow-dark">Nuestra historia</span>
            <h2>Un clásico de la esquina, desde siempre</h2>
            <p>
              Hace años que somos punto de encuentro del barrio. Desayunos
              tempranos, almuerzos de los de antes y noches para quedarse.
              Cocinamos con tiempo y servimos con cariño.
            </p>
            <p>
              Cada plato sale como nos gusta a nosotros: simple, generoso
              y bien hecho. Te esperamos en la mesa o te lo llevamos a casa.
            </p>
          </div>
        </div>
      </section>

      {/* ── Especialidades ── */}
      <section className="lp-section lp-section-soft" id="especialidades">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow lp-eyebrow-dark">Lo que hacemos</span>
            <h2>Nuestras especialidades</h2>
          </div>
          <div className="lp-cards">
            {ESPECIALIDADES.map((e) => (
              <article className="lp-card" key={e.titulo}>
                <div className="lp-card-icon"><i className={`fas ${e.icon}`}></i></div>
                <h3>{e.titulo}</h3>
                <p>{e.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="lp-cta" id="contacto">
        <div className="lp-container lp-cta-inner">
          <h2>¿Listo para pedir?</h2>
          <p>Acercate a la barra o ingresá al sistema de gestión para tomar tu pedido.</p>
          <Link to="/pedidos" className="lp-btn lp-btn-light lp-btn-lg">
            <i className="fas fa-arrow-right-to-bracket"></i> Ingresar al sistema
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-brand lp-brand-footer">
            <span className="lp-brand-icon"><img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="La Esquina" /></span>
            <span className="lp-brand-text">
              <strong>La Esquina</strong>
              <small>Resto Bar</small>
            </span>
          </div>
          <div className="lp-footer-info">
            <span><i className="fas fa-location-dot"></i> Av. Siempreviva 742, tu barrio</span>
            <span><i className="fas fa-clock"></i> Lun a Dom · 8:00 – 00:00</span>
            <span><i className="fas fa-phone"></i> (011) 4000-0000</span>
          </div>
        </div>
        <div className="lp-footer-bottom">
          © {new Date().getFullYear()} La Esquina · Resto Bar — Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default Landing;
