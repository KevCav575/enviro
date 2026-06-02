import { NavLink, useNavigate } from 'react-router-dom';
import { Icon }           from '@/components/ui/Icon';
import { giroColor, giroLabel } from '@/constants/giros';
import { useAppStore }    from '@/store/useAppStore';
import type { User }      from '@/types';

interface NavItem {
  id:            string;
  label:         string;
  icon:          string;
  to:            string;
  consultorOnly?: boolean;
}

interface SidebarProps {
  projectId:   string;
  clientUser:  User;
  isConsultor: boolean;
  isAdmin:     boolean;
  alertaCount: number;
}

const NAV_ITEMS: Omit<NavItem, 'to'>[] = [
  { id: 'dashboard',    label: 'Dashboard',      icon: 'home',      },
  { id: 'cuestionario', label: 'Diagnóstico',     icon: 'clipboard', },
  { id: 'tramites',     label: 'Trámites',        icon: 'list',      },
  { id: 'cronograma',   label: 'Cronograma',      icon: 'calendar',  },
  { id: 'alertas',      label: 'Alertas',         icon: 'bell',      },
  { id: 'consultor',    label: 'Panel Consultor', icon: 'send',      consultorOnly: true },
  { id: 'iso14001',     label: 'ISO 14001',       icon: 'shield',    },
];

const NAV_PATHS: Record<string, string> = {
  dashboard:    'dashboard',
  cuestionario: 'diagnostico',
  tramites:     'tramites',
  cronograma:   'cronograma',
  alertas:      'alertas',
  consultor:    'consultor-panel',
  iso14001:     'iso14001',
};

export function Sidebar({ projectId, clientUser, isConsultor, isAdmin, alertaCount }: SidebarProps) {
  const navigate         = useNavigate();
  const { logout, currentUser } = useAppStore();

  const base = `/proyecto/${projectId}`;

  const navItems: NavItem[] = NAV_ITEMS.map(item => ({
    ...item,
    to: `${base}/${NAV_PATHS[item.id]}`,
  }));

  const handleBack = () => {
    if (isAdmin)        navigate('/admin');
    else if (isConsultor) navigate('/consultor');
    else                navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = clientUser.empresa.slice(0, 2).toUpperCase();
  const giroClr  = giroColor(clientUser.giro ?? '');

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: 'linear-gradient(180deg, #155e2e 0%, #166634 40%, #14532d 100%)' }}
    >
      {/* ── Logo / back button ── */}
      {isConsultor || isAdmin ? (
        <button
          onClick={handleBack}
          className="flex items-center gap-2.5 px-4 py-3.5 hover:bg-white/10 transition-colors text-left border-b border-white/10"
        >
          <Icon n="cl" s={14} c="rgba(255,255,255,0.6)" />
          <span className="text-green-200 text-xs font-medium">
            {isAdmin ? 'Panel de administración' : 'Ver mis clientes'}
          </span>
        </button>
      ) : (
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/20">
            <Icon n="leaf" s={15} c="white" />
          </div>
          <div>
            <p className="text-white font-bold text-xs leading-tight">EnviroGest MX</p>
            <p className="text-green-300/70 text-[11px] leading-tight">by BIOIMPACT</p>
          </div>
        </div>
      )}

      {/* ── Client context ── */}
      <div className="px-3 py-2.5 mx-3 mt-3 mb-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: giroClr }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-xs truncate leading-tight">{clientUser.empresa}</p>
            <p className="text-green-300/70 text-[11px] truncate leading-tight">{giroLabel(clientUser.giro ?? '')}</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        {navItems.map(item => {
          if (item.consultorOnly && !isConsultor) return null;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex-shrink-0">
                    <Icon n={item.icon} s={16} c={isActive ? 'white' : 'rgba(255,255,255,0.55)'} />
                    {item.id === 'alertas' && alertaCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold"
                      >
                        {alertaCount > 9 ? '9+' : alertaCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-medium leading-none ${isActive ? 'text-white' : 'text-green-100/80'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="px-3 pb-3 pt-1 border-t border-white/10 mt-1">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
            <Icon n="user" s={13} c="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-tight">
              {currentUser?.nombre ?? clientUser.nombre}
            </p>
            <p className="text-green-300/60 text-[11px] truncate leading-tight">
              {currentUser?.email ?? clientUser.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors opacity-60 group-hover:opacity-100"
            data-tip="Cerrar sesión"
          >
            <Icon n="logout" s={13} c="white" />
          </button>
        </div>
      </div>
    </aside>
  );
}
