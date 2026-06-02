import { create } from 'zustand';
import type { AppData, Proyecto, User } from '@/types';
import { storageService } from '@/services/localStorage.service';
import { authService } from '@/services/auth.service';
import type { AuthUser } from '@/services/auth.service';
import { uid, today } from '@/lib/utils';

interface AppStore {
  data: AppData;
  currentUser: User | null;
  activeProjectId: string | null;
  sessionLoading: boolean;

  login: (email: string, pwd: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (fields: {
    nombre: string; empresa: string; giro: string; email: string; pwd: string;
  }) => Promise<User | null>;
  initSession: () => Promise<void>;

  setActiveProject: (id: string | null) => void;
  updateProject: (partial: Partial<Proyecto>) => void;

  createClientWithProject: (fields: {
    nombre: string; empresa: string; giro: string; email: string; pwd: string;
    consultor_id: string; notas: string;
  }) => Promise<{ user: User; pwd: string } | null>;
  createConsultor: (fields: { nombre: string; email: string; pwd: string }) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<void>;
  deleteProject: (projectId: string) => void;
  assignConsultor: (projectId: string, consultorId: string | null) => void;
}

function persist(data: AppData): void {
  storageService.saveData(data);
}

function toUser(a: AuthUser): User {
  return {
    id:          a.id,
    nombre:      a.nombre,
    empresa:     a.empresa ?? '',
    email:       a.email,
    rol:         a.rol,
    giro:        a.giro,
    proyecto_id: a.proyecto_id,
  };
}

function upsertUser(data: AppData, user: User): AppData {
  const exists = data.usuarios.find(u => u.id === user.id);
  return {
    ...data,
    usuarios: exists
      ? data.usuarios.map(u => u.id === user.id ? { ...u, ...user } : u)
      : [...data.usuarios, user],
  };
}

function buildNewProject(
  proyId: string,
  userId: string,
  giro: string,
  consultorId: string | null,
  notas: string,
): Proyecto {
  return {
    id:           proyId,
    cliente_id:   userId,
    consultor_id: consultorId,
    cuestionario: {
      respondido: false,
      respuestas: {
        giro,
        emisiones:          null,
        agua:               null,
        residuos_peligrosos: false,
        residuos_especiales: false,
        obras:              null,
      },
      fecha: null,
    },
    tramites:           [],
    alertas:            [],
    instrucciones_admin: [],
    reuniones:          [],
    iso14001:           { secciones: {} },
    creado:             today(),
    notas,
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  data:            storageService.getData(),
  currentUser:     null,
  activeProjectId: null,
  sessionLoading:  true,

  async login(email, pwd) {
    try {
      const authUser = await authService.login(email, pwd);
      const user     = toUser(authUser);
      const updated  = upsertUser(get().data, user);
      persist(updated);
      set({ data: updated, currentUser: user });
      return user;
    } catch {
      return null;
    }
  },

  async logout() {
    try { await authService.logout(); } catch { /* network failure — still clear local state */ }
    set({ currentUser: null, activeProjectId: null });
  },

  async register({ nombre, empresa, giro, email, pwd }) {
    try {
      const { user: authUser, proyecto_id } = await authService.register({
        nombre, empresa, giro, email, password: pwd,
      });
      const user    = toUser(authUser);
      const { data } = get();
      const newProj = buildNewProject(proyecto_id, user.id, giro, null, '');
      const updated: AppData = {
        usuarios:  upsertUser(data, user).usuarios,
        proyectos: [...data.proyectos, newProj],
      };
      persist(updated);
      set({ data: updated, currentUser: user, activeProjectId: proyecto_id });
      return user;
    } catch {
      return null;
    }
  },

  async initSession() {
    set({ sessionLoading: true });
    try {
      const authUser = await authService.me();
      if (authUser) {
        const user    = toUser(authUser);
        const updated = upsertUser(get().data, user);
        persist(updated);
        set({ data: updated, currentUser: user });
      } else {
        set({ currentUser: null });
      }
    } catch {
      set({ currentUser: null });
    } finally {
      set({ sessionLoading: false });
    }
  },

  setActiveProject(id) {
    set({ activeProjectId: id });
  },

  updateProject(partial) {
    const { data, activeProjectId } = get();
    if (!activeProjectId) return;
    const updated: AppData = {
      ...data,
      proyectos: data.proyectos.map(p =>
        p.id === activeProjectId ? { ...p, ...partial } : p,
      ),
    };
    persist(updated);
    set({ data: updated });
  },

  async createClientWithProject({ nombre, empresa, giro, email, pwd: rawPwd, consultor_id, notas }) {
    const finalPwd = rawPwd || Math.random().toString(36).slice(2, 10);
    try {
      const proyId   = uid();
      const authUser = await authService.createUser({
        nombre, empresa, email, password: finalPwd,
        rol: 'cliente', giro, proyecto_id: proyId,
      });
      const user           = toUser(authUser);
      const efectiveProyId = user.proyecto_id ?? proyId;
      const { data }       = get();
      const newProj        = buildNewProject(efectiveProyId, user.id, giro, consultor_id || null, notas);
      const updated: AppData = {
        usuarios:  upsertUser(data, user).usuarios,
        proyectos: [...data.proyectos, newProj],
      };
      persist(updated);
      set({ data: updated });
      return { user, pwd: finalPwd };
    } catch (err) {
      console.error('[createClientWithProject]', err);
      return null;
    }
  },

  async createConsultor({ nombre, email, pwd }) {
    try {
      const authUser = await authService.createUser({
        nombre, empresa: 'BIOIMPACT', email, password: pwd, rol: 'consultor',
      });
      const user    = toUser(authUser);
      const updated = upsertUser(get().data, user);
      persist(updated);
      set({ data: updated });
      return user;
    } catch (err) {
      console.error('[createConsultor]', err);
      return null;
    }
  },

  async deleteUser(userId) {
    try { await authService.deleteUser(userId); } catch { /* ignore if not synced to server */ }
    const { data } = get();
    const proj     = data.proyectos.find(p => p.cliente_id === userId);
    const updated: AppData = {
      usuarios: data.usuarios.filter(u => u.id !== userId),
      proyectos: proj
        ? data.proyectos.filter(p => p.id !== proj.id)
        : data.proyectos.map(p =>
            p.consultor_id === userId ? { ...p, consultor_id: null } : p,
          ),
    };
    persist(updated);
    set({ data: updated });
  },

  deleteProject(projectId) {
    const { data } = get();
    const proj     = data.proyectos.find(p => p.id === projectId);
    const updated: AppData = {
      usuarios:  proj ? data.usuarios.filter(u => u.id !== proj.cliente_id) : data.usuarios,
      proyectos: data.proyectos.filter(p => p.id !== projectId),
    };
    persist(updated);
    set({ data: updated });
  },

  assignConsultor(projectId, consultorId) {
    const { data } = get();
    const updated: AppData = {
      ...data,
      proyectos: data.proyectos.map(p =>
        p.id === projectId ? { ...p, consultor_id: consultorId } : p,
      ),
    };
    persist(updated);
    set({ data: updated });
  },
}));
