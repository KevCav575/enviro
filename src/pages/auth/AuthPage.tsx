import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { Icon }                from '@/components/ui/Icon';
import { Input }               from '@/components/ui/Input';
import { SelectField }         from '@/components/ui/SelectField';
import { GIROS }               from '@/constants/giros';
import { useAppStore }         from '@/store/useAppStore';

type Mode = 'login' | 'register' | 'forgot';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, currentUser, sessionLoading } = useAppStore();

  const [mode, setMode]       = useState<Mode>('login');
  const [email, setEmail]     = useState('');
  const [pwd, setPwd]         = useState('');
  const [nombre, setNombre]   = useState('');
  const [empresa, setEmpresa] = useState('');
  const [giro, setGiro]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (!sessionLoading && currentUser) redirectByRole(currentUser.rol);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, sessionLoading]);

  function redirectByRole(rol: string) {
    if (rol === 'admin')     { navigate('/admin');     return; }
    if (rol === 'consultor') { navigate('/consultor'); return; }
    const { data, currentUser: cu } = useAppStore.getState();
    const proj = data.proyectos.find(p => p.cliente_id === cu?.id || p.id === cu?.proyecto_id);
    navigate(proj ? `/proyecto/${proj.id}/dashboard` : '/');
  }

  const switchMode = (m: Mode) => { setMode(m); setError(''); setForgotSent(false); };

  const handleLogin = async () => {
    if (!email || !pwd) { setError('Ingresa tu correo y contraseña.'); return; }
    setLoading(true); setError('');
    const u = await login(email, pwd);
    setLoading(false);
    if (!u) setError('Credenciales incorrectas. Verifica tus datos o contacta a BIOIMPACT.');
    else    redirectByRole(u.rol);
  };

  const handleRegister = async () => {
    const err = validateRegister({ nombre, empresa, email, pwd, giro });
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    const user = await register({ nombre, empresa, giro, email, pwd });
    setLoading(false);
    if (!user) setError('Ya existe una cuenta con ese correo, o el servidor no está disponible.');
    else       redirectByRole(user.rol);
  };

  const handleForgot = async () => {
    if (!email || !EMAIL_RE.test(email)) { setError('Ingresa un correo válido.'); return; }
    setLoading(true); setError('');
    // Placeholder — wire up to POST /api/auth/forgot-password when implemented
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setForgotSent(true);
  };

  if (sessionLoading) return null;

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: 320, height: 320, borderRadius: 9999, background: 'radial-gradient(circle,rgba(16,185,129,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: 260, height: 260, borderRadius: 9999, background: 'radial-gradient(circle,rgba(5,150,105,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', right: '42%', width: 180, height: 180, borderRadius: 9999, background: 'radial-gradient(circle,rgba(16,185,129,0.10) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* Forest silhouette */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 200, opacity: 0.15, pointerEvents: 'none' }} viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0,220 L0,130 L40,80 L80,130 L100,90 L140,40 L180,90 L200,60 L240,110 L270,70 L310,30 L350,70 L380,50 L420,100 L450,60 L490,110 L520,80 L560,40 L600,80 L630,55 L670,100 L700,65 L740,30 L780,65 L810,45 L850,90 L880,55 L920,100 L950,70 L990,120 L1020,85 L1060,50 L1100,85 L1130,60 L1170,105 L1200,75 L1240,130 L1280,90 L1320,140 L1360,100 L1400,150 L1440,120 L1440,220 Z" fill="white" />
      </svg>

      {/* Floating leaf orbs */}
      <div className="leaf-orb-1" style={{ position: 'absolute', top: '8%', left: '4%', width: 64, height: 64, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Icon n="leaf" s={28} c="rgba(255,255,255,0.3)" />
      </div>
      <div className="leaf-orb-2" style={{ position: 'absolute', top: '55%', left: '8%', width: 48, height: 48, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Icon n="leaf" s={20} c="rgba(255,255,255,0.25)" />
      </div>

      {/* ══ LEFT PANEL — brand & value prop ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px 64px', position: 'relative', zIndex: 2, minWidth: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(5,150,105,0.15))', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <Icon n="leaf" s={26} c="#6ee7b7" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: 22, margin: 0, lineHeight: 1.1 }}>EnviroGest MX</p>
            <p style={{ color: '#6ee7b7', fontSize: 12, fontWeight: 600, margin: 0, letterSpacing: '0.5px' }}>by BIOIMPACT</p>
          </div>
        </div>

        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(28px,3.5vw,52px)', lineHeight: 1.1, margin: '0 0 20px 0', letterSpacing: '-1.5px' }}>
          Gestión ambiental<br />
          <span style={{ background: 'linear-gradient(90deg,#6ee7b7,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>inteligente</span><br />
          para Nuevo León
        </h1>

        <p style={{ color: 'rgba(209,250,229,0.8)', fontSize: 15, lineHeight: 1.75, maxWidth: 440, margin: '0 0 44px 0' }}>
          Diagnóstico automatizado de obligaciones, seguimiento de trámites ante <strong style={{ color: '#a7f3d0' }}>SEMARNAT</strong> y autoridades estatales, cronograma editable y cumplimiento <strong style={{ color: '#a7f3d0' }}>ISO 14001:2015</strong>.
        </p>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { n: '13', l: 'Trámites catalogados', ic: 'clipboard' },
            { n: 'ISO', l: '14001:2015 integrado', ic: 'shield' },
            { n: 'NL',  l: 'Leyes y NOMs vigentes', ic: 'check' },
          ].map(x => (
            <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon n={x.ic} s={17} c="#6ee7b7" />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0, lineHeight: 1 }}>{x.n}</p>
                <p style={{ color: 'rgba(167,243,208,0.65)', fontSize: 11, margin: 0, marginTop: 2 }}>{x.l}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ position: 'absolute', bottom: 32, left: 64, color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: 0 }}>
          © 2026 BIOIMPACT · Allende, Nuevo León
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: 'linear-gradient(to bottom,transparent,rgba(255,255,255,0.1),transparent)', alignSelf: 'stretch', flexShrink: 0 }} />

      {/* ══ RIGHT PANEL — auth form ══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <div className="auth-card" style={{ width: 420, padding: '40px' }}>

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#064e3b,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon n="leaf" s={17} c="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>EnviroGest MX</span>
          </div>

          <h2 style={{ fontSize: 21, fontWeight: 800, color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            {mode === 'login'    && 'Bienvenido de vuelta'}
            {mode === 'register' && 'Crear cuenta'}
            {mode === 'forgot'   && 'Recuperar contraseña'}
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 22px 0' }}>
            {mode === 'login'    && 'Ingresa tus credenciales para continuar'}
            {mode === 'register' && 'Completa tu perfil para comenzar'}
            {mode === 'forgot'   && 'Te enviaremos un enlace de recuperación'}
          </p>

          {/* Tab switcher (login / register only) */}
          {mode !== 'forgot' && (
            <div style={{ display: 'flex', background: '#064e3b', borderRadius: 12, padding: 4, marginBottom: 22, gap: 4 }}>
              <button className={`auth-tab-btn${mode === 'login'    ? ' on' : ''}`} onClick={() => switchMode('login')}>Iniciar sesión</button>
              <button className={`auth-tab-btn${mode === 'register' ? ' on' : ''}`} onClick={() => switchMode('register')}>Registrarse</button>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 12, color: '#dc2626', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Icon n="alert" s={14} c="#dc2626" />
              {error}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Correo electrónico" value={email} onChange={setEmail} type="email" placeholder="tu@empresa.com" />
              <Input label="Contraseña" value={pwd} onChange={setPwd} type="password" placeholder="••••••••" />
              <button className="auth-submit" onClick={handleLogin} disabled={loading}>
                {loading ? 'Verificando…' : 'Iniciar sesión →'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => switchMode('forgot')}
                  style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Nombre completo" value={nombre} onChange={setNombre} placeholder="Juan García" required />
                <Input label="Empresa" value={empresa} onChange={setEmpresa} placeholder="ACME S.A." required />
              </div>
              <SelectField label="Giro industrial" value={giro} onChange={setGiro} options={GIROS.map(g => ({ value: g.id, label: g.label }))} required />
              <Input label="Correo electrónico" value={email} onChange={setEmail} type="email" placeholder="tu@empresa.com" required />
              <Input label="Contraseña" value={pwd} onChange={setPwd} type="password" placeholder="Mínimo 6 caracteres" required />
              <button className="auth-submit" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creando cuenta…' : 'Crear cuenta →'}
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {forgotSent ? (
                <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, textAlign: 'center' }}>
                  <Icon n="check" s={20} c="#16a34a" cls="mx-auto mb-2" />
                  <p style={{ fontSize: 13, color: '#166534', fontWeight: 600, margin: '0 0 4px 0' }}>Correo enviado</p>
                  <p style={{ fontSize: 12, color: '#15803d', margin: 0 }}>Revisa tu bandeja de entrada.</p>
                </div>
              ) : (
                <>
                  <Input label="Correo electrónico" value={email} onChange={setEmail} type="email" placeholder="tu@empresa.com" />
                  <button className="auth-submit" onClick={handleForgot} disabled={loading}>
                    {loading ? 'Enviando…' : 'Enviar enlace →'}
                  </button>
                </>
              )}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', margin: '20px 0 0 0' }}>
            Sesión segura · JWT httpOnly · bcrypt
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function validateRegister(f: { nombre: string; empresa: string; email: string; pwd: string; giro: string }): string | null {
  if (!f.nombre || !f.empresa || !f.email || !f.pwd || !f.giro) return 'Completa todos los campos.';
  if (f.pwd.length < 6)            return 'La contraseña debe tener al menos 6 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'El correo no es válido.';
  return null;
}
