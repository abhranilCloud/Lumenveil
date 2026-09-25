import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Moon, Sun, ShieldCheck, WalletCards, LogOut, Menu, X } from 'lucide-react';
import { useWallet } from './contexts/WalletContext';
import LandingPage from './pages/LandingPage';
import GatePage from './pages/GatePage';
import AdminPage from './pages/AdminPage';
import ObservatoryPage from './pages/ObservatoryPage';
import PhilosophyPage from './pages/PhilosophyPage';

export default function App() {
  const { address, isConnected, connect, disconnect, isConnecting, walletStatus, walletName } = useWallet();
  const [theme, setTheme] = useState<'night' | 'day'>(() => (localStorage.getItem('LUMENVEIL_THEME') as 'night' | 'day') || 'night');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('LUMENVEIL_THEME', theme); }, [theme]);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  const shortAddress = address ? `${address.slice(0, 7)}…${address.slice(-5)}` : '';

  return <div className="site-shell">
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark"><span /></span><span>LUMENVEIL</span></Link>
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</button>
      <nav className={`main-nav ${mobileOpen ? 'open' : ''}`}>
        <NavLink to="/gate">Enter gate</NavLink>
        <NavLink to="/observatory">Observatory</NavLink>
        <NavLink to="/philosophy">Privacy model</NavLink>
        <NavLink to="/steward">Steward desk</NavLink>
      </nav>
      <div className="topbar-actions">
        <button className="icon-button" onClick={() => setTheme(theme === 'night' ? 'day' : 'night')} aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} theme`} title="Toggle day / night">{theme === 'night' ? <Sun size={17} /> : <Moon size={17} />}</button>
        {isConnected ? <button className="wallet-chip" onClick={disconnect} title="Disconnect wallet"><span className="online-dot" /><span>{walletName || 'Wallet'} · {shortAddress}</span><LogOut size={14} /></button> : <button className="connect-button" onClick={() => connect('preprod')} disabled={isConnecting || walletStatus === 'not-found'}><WalletCards size={15} />{isConnecting ? 'Opening…' : walletStatus === 'not-found' ? 'Install wallet' : 'Connect wallet'}</button>}
      </div>
    </header>
    <main><Routes><Route path="/" element={<LandingPage />} /><Route path="/gate" element={<GatePage />} /><Route path="/steward" element={<AdminPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="/observatory" element={<ObservatoryPage />} /><Route path="/philosophy" element={<PhilosophyPage />} /></Routes></main>
    <footer className="footer"><span><ShieldCheck size={14} /> Private by intention, verifiable by design.</span><span className="mono">MIDNIGHT / PREPROD READY</span></footer>
  </div>;
}
