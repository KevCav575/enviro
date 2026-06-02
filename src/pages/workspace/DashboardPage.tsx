import { useNavigate, useParams } from 'react-router-dom';
import { Icon }           from '@/components/ui/Icon';
import { Btn }            from '@/components/ui/Btn';
import { Card }           from '@/components/ui/Card';
import { CalendarWidget } from '@/components/CalendarWidget';
import { ESTADOS }        from '@/constants/estados';
import { ISO_DATA }       from '@/constants/iso14001';
import { useAppStore }    from '@/store/useAppStore';
import type { ISO14001Secciones } from '@/types';

interface KpiConfig {
  label:  string;
  value:  number;
  icon:   string;
  accent: string;
  color:  string;
}

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate      = useNavigate();
  const { data, currentUser } = useAppStore();

  const proj       = data.proyectos.find(p => p.id === projectId);
  const clientUser = proj ? data.usuarios.find(u => u.id === proj.cliente_id) : undefined;
  if (!proj || !clientUser) return null;

  const tramites = proj.tramites ?? [];
  const alertas  = proj.alertas  ?? [];
  const unread   = alertas.filter(a => !a.leido).length;

  const kpis: KpiConfig[] = [
    { label: 'Trámites totales', value: tramites.length,                                                                            icon: 'clipboard', accent: 'accent-green',   color: '#166534' },
    { label: 'Cumplidos',        value: tramites.filter(t => t.estado === 'cumplido').length,                                        icon: 'check',     accent: 'accent-emerald', color: '#059669' },
    { label: 'En proceso',       value: tramites.filter(t => ['recopilando','ingresado','en_revision'].includes(t.estado)).length,   icon: 'list',      accent: 'accent-blue',    color: '#2563eb' },
    { label: 'Vencidos',         value: tramites.filter(t => t.estado === 'vencido').length,                                         icon: 'alert',     accent: 'accent-red',     color: '#dc2626' },
  ];

  const isoSecciones: ISO14001Secciones = proj.iso14001?.secciones ?? {};
  const isoAll  = Object.values(ISO_DATA).flatMap(s => s.items);
  const isoDone = Object.values(isoSecciones).reduce(
    (acc, section) => acc + Object.values(section).filter(Boolean).length, 0,
  );
  const isoPct = isoAll.length ? Math.round(isoDone / isoAll.length * 100) : 0;

  const isoSectionBreakdown = Object.entries(ISO_DATA).map(([key, sec]) => {
    const total  = sec.items.length;
    const done   = Object.values(isoSecciones[key] ?? {}).filter(Boolean).length;
    return { key, nombre: sec.nombre, total, done, pct: total ? Math.round(done / total * 100) : 0 };
  });

  const displayUser = currentUser?.rol === 'cliente' ? currentUser : clientUser;
  const greeting    = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';

  const pct = tramites.length
    ? Math.round(tramites.filter(t => t.estado === 'cumplido').length / tramites.length * 100)
    : 0;

  return (
    <div className="p-6 fade-in max-w-[1400px]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-0.5">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting}, <span className="text-green-800">{displayUser.nombre.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{clientUser.empresa}</p>
        </div>
        {tramites.length > 0 && (
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Avance general</p>
              <p className="text-xl font-bold text-green-800">{pct}%</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <div className="w-12 h-12 relative">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9"
                    fill="none" stroke="#16a34a" strokeWidth="3"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(k => (
          <div key={k.label} className={`kpi-card ${k.accent}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-black leading-none" style={{ color: k.color }}>{k.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-2">{k.label}</p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${k.color}15` }}
              >
                <Icon n={k.icon} s={16} c={k.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CalendarWidget tramites={tramites} alertas={alertas} />
        </div>

        <div className="space-y-4">
          {/* Alerts panel */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Icon n="bell" s={14} c="#374151" />
                Alertas recientes
              </h3>
              {unread > 0 && (
                <span className="badge badge-red">{unread} nuevas</span>
              )}
            </div>
            {alertas.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Sin alertas pendientes</p>
            ) : (
              <div className="space-y-1.5">
                {alertas.slice(0, 4).map(a => (
                  <div
                    key={a.id}
                    className={`flex gap-2.5 p-2.5 rounded-lg border ${
                      a.leido ? 'border-transparent' : 'border-amber-100 bg-amber-50'
                    }`}
                  >
                    <Icon n="bell" s={13} c={a.leido ? '#9CA3AF' : '#F59E0B'} cls="mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{a.mensaje}</p>
                  </div>
                ))}
              </div>
            )}
            {alertas.length > 0 && (
              <button
                onClick={() => navigate(`/proyecto/${projectId}/alertas`)}
                className="text-xs text-green-700 font-semibold mt-2 hover:underline flex items-center gap-1"
              >
                Ver todas <Icon n="cl" s={10} c="#15803d" />
              </button>
            )}
          </Card>

          {/* ISO 14001 card — with per-section breakdown */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icon n="shield" s={14} c="#166534" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-none">ISO 14001:2015</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{isoDone} / {isoAll.length} ítems</p>
                </div>
              </div>
              <span className="text-2xl font-black text-green-800">{isoPct}%</span>
            </div>

            {/* Global bar */}
            <div className="progress-track mb-4">
              <div
                className="progress-fill"
                style={{ width: `${isoPct}%`, background: 'linear-gradient(90deg,#15803d,#22c55e)' }}
              />
            </div>

            {/* Per-section mini breakdown */}
            <div className="space-y-2">
              {isoSectionBreakdown.map(s => (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 w-4 flex-shrink-0">§{s.key}</span>
                  <div className="flex-1 progress-track" style={{ height: 4 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width:      `${s.pct}%`,
                        height:     '4px',
                        background: s.pct === 100 ? '#16a34a' : s.pct > 0 ? '#22c55e' : '#e2e8f0',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-8 text-right flex-shrink-0">{s.done}/{s.total}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/proyecto/${projectId}/iso14001`)}
              className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1 mt-3"
            >
              Ver checklist completo <Icon n="cl" s={10} c="#15803d" />
            </button>
          </Card>
        </div>
      </div>

      {/* ── Compliance matrix ── */}
      {tramites.length > 0 && (
        <Card className="p-5 mt-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon n="list" s={15} c="#374151" />
            Matriz de cumplimiento
          </h3>
          <div className="space-y-3">
            {tramites.map(t => {
              const e = ESTADOS[t.estado] ?? ESTADOS.no_iniciado;
              return (
                <div key={t._id} className="flex items-center gap-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                      {t.nombre}
                    </p>
                    <p className="text-[10px] text-gray-400">{t.autoridad}</p>
                  </div>
                  <div className="w-32">
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${e.pct}%`, background: e.color }} />
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-semibold w-24 text-right tabular-nums"
                    style={{ color: e.color }}
                  >
                    {e.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── CTA — questionnaire not yet answered ── */}
      {!proj.cuestionario?.respondido && (
        <div className="mt-5 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-800 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Icon n="clipboard" s={22} c="white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-green-900 text-sm mb-0.5">Inicia el diagnóstico ambiental</p>
            <p className="text-xs text-green-700 leading-relaxed">
              Responde 5 preguntas para identificar automáticamente las obligaciones ambientales aplicables a tu empresa.
            </p>
          </div>
          <Btn onClick={() => navigate(`/proyecto/${projectId}/diagnostico`)}>
            Iniciar diagnóstico
          </Btn>
        </div>
      )}
    </div>
  );
}
