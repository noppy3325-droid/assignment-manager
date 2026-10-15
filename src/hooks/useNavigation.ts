import { useCallback, useEffect, useState } from 'react';
type View = 'tasks' | 'history' | 'calendar' | 'settings';
type Navigation = { view: View; list: 'tasks' | 'history'; overlay: 'task' | 'new' | 'edit' | null; id: string | null };
function readRoute(): Navigation {
  const path = location.pathname.slice(1);
  const view: View = ['tasks', 'history', 'calendar', 'settings'].includes(path) ? path as View : 'tasks';
  const params = new URLSearchParams(location.search);
  const overlay = params.has('task') ? 'task' : params.has('new') ? 'new' : params.has('edit') ? 'edit' : null;
  return { view, list: view === 'history' ? 'history' : 'tasks', overlay, id: overlay ? params.get(overlay) : null };
}
export function useNavigation() {
  const [route, setRoute] = useState(readRoute);
  const [fromPop, setFromPop] = useState(false);
  useEffect(() => {
    const pop = () => { setFromPop(true); setRoute(readRoute()); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    const url = `/${route.view}${route.overlay ? `?${route.overlay}=${encodeURIComponent(route.id || '1')}` : ''}`;
    if (fromPop) setFromPop(false);
    else if (location.pathname + location.search !== url) history.pushState(null, '', url);
  }, [route]);
  const setView = useCallback((view: View) => setRoute(r => ({ ...r, view, list: view === 'tasks' || view === 'history' ? view : r.list, overlay: null, id: null })), []);
  const overlay = useCallback((kind: Navigation['overlay'], open: boolean, id: string | null = null) => {
    setRoute(r => open ? { ...r, overlay: kind, id } : r.overlay === kind ? { ...r, overlay: null, id: null } : r);
  }, []);
  return { route, view: route.view,
    selectedId: route.overlay === 'task' ? route.id : null,
    setSelectedId: (id: string | null) => overlay('task', !!id, id),
    isAdding: route.overlay === 'new', setIsAdding: (open: boolean) => overlay('new', open),
    isEditing: route.overlay === 'edit', setIsEditing: (open: boolean, id?: string) => overlay('edit', open, id ?? route.id),
    isCalendarOpen: route.view === 'calendar', setIsCalendarOpen: (open: boolean) => { if (open) setView('calendar'); else setRoute(r => r.view === 'calendar' ? { ...r, view: r.list, overlay: null } : r); },
    isSettingsOpen: route.view === 'settings', setIsSettingsOpen: (open: boolean) => { if (open) setView('settings'); else setRoute(r => r.view === 'settings' ? { ...r, view: r.list, overlay: null } : r); },
    activeTab: route.list === 'history' ? 'history' as const : 'active' as const,
    setActiveTab: (value: 'active' | 'history' | ((prev: 'active' | 'history') => 'active' | 'history')) => setRoute(r => {
      const next = typeof value === 'function' ? value(r.list === 'history' ? 'history' : 'active') : value;
      return { ...r, view: next === 'active' ? 'tasks' : 'history', list: next === 'active' ? 'tasks' : 'history', overlay: null, id: null };
    }), setView,
  };
}
