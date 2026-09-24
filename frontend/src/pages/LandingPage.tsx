import { ArrowUpRight, EyeOff, Fingerprint, KeyRound, Sparkles, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return <div className="page">
    <section className="hero-grid">
      <div>
        <div className="eyebrow">Private allowlist access / Midnight</div>
        <h1 className="display">A quiet door.<br /><em>A clear proof.</em></h1>
        <p className="lede">Lumenveil lets a member prove they belong inside a private space without handing over their identity, score, or wallet trail.</p>
        <div className="actions"><Link className="button primary" to="/gate">Open a private gate <ArrowUpRight size={16} /></Link><Link className="button subtle" to="/philosophy">Study the privacy model</Link></div>
        <div className="hero-rail"><span>01</span> witness stays local <span>·</span><span>02</span> proof goes public <span>·</span><span>03</span> identity stays yours</div>
      </div>
      <div className="hero-orbit" aria-label="Lumenveil private proof visualization">
        <div className="proof-scene">
          <div className="scene-haze" />
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="orbit orbit-c" />
          <div className="axis-line" />
          <div className="orb-core"><span className="core-shine" /><span className="core-cut" /></div>
          <span className="satellite satellite-a" />
          <span className="satellite satellite-b" />
          <span className="satellite satellite-c" />
          <span className="scene-tag scene-tag-top">PRIVATE / 0x2A</span>
          <span className="scene-tag scene-tag-bottom">PROOF SURFACE · 01</span>
        </div>
        <div className="signal-card"><small>PRIVATE SIGNAL</small><div className="signal-line" /><strong>✓ 72+</strong><small>threshold verified · value concealed</small></div>
      </div>
    </section>
    <section className="section"><div className="section-head"><div><div className="eyebrow">A different kind of access</div><h2>Reveal the result.<br />keep the reason in shadow.</h2></div><p>The public chain only needs to know that an eligible member passed the gate once. Everything sensitive remains in the proving session.</p></div>
      <div className="feature-grid"><article className="feature-card"><Fingerprint size={21} /><div><h3>Unlinkable entry</h3><p>A pass-scoped nullifier stops replay without publishing a member identity or address.</p></div></article><article className="feature-card"><EyeOff size={21} /><div><h3>Private signal</h3><p>Your eligibility score is supplied as a witness and compared inside the Compact circuit.</p></div></article><article className="feature-card"><Waves size={21} /><div><h3>Observable proof</h3><p>Curators get a clean, verifiable entry count — not a dossier on the people behind it.</p></div></article></div>
    </section>
    <div className="metric-band"><div className="metric"><strong>01</strong><small>public outcome</small></div><div className="metric"><strong>00</strong><small>scores disclosed</small></div><div className="metric"><strong>32B</strong><small>nullifier space</small></div><div className="metric"><strong>24/7</strong><small>verifiable state</small></div></div>
    <section className="section"><div className="section-head"><div><div className="eyebrow">The rhythm</div><h2>Four moves, one veil.</h2></div></div><div className="step-list"><div className="step-item"><div className="step-number">01</div><div><h3>Curator opens a gate</h3><p>A threshold, pass identifier, expiry and capacity are committed to the public ledger.</p></div></div><div className="step-item"><div className="step-number">02</div><div><h3>Member arrives with a private signal</h3><p>The browser keeps the score and passphrase local. They are never circuit arguments.</p></div></div><div className="step-item"><div className="step-number">03</div><div><h3>Compact proves the predicate</h3><p>Midnight verifies the proof that the hidden score clears the visible threshold.</p></div></div><div className="step-item"><div className="step-number">04</div><div><h3>The observatory sees only a new star</h3><p>A nullifier and counter update make the result public while keeping the member unlinkable.</p></div></div></div></section>
    <section className="panel" style={{ marginTop: 20 }}><div className="eyebrow">Made for selective disclosure</div><h2 style={{ marginTop: 14 }}>Not a black box. A smaller surface.</h2><p>Explore the live public state in the Observatory, or connect a Midnight wallet and generate a real proof from the Gate. Steward deployment is intentionally separated from member entry.</p><div className="actions"><Link className="button" to="/observatory"><Sparkles size={15} /> View observatory</Link><Link className="button" to="/steward"><KeyRound size={15} /> Steward desk</Link></div></section>
  </div>;
}
