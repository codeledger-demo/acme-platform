declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

export type ScreenName = 'Login' | 'Dashboard' | 'Profile';

export interface NavigationRoute {
  name: ScreenName;
  label: string;
  icon: string;
  requiresAuth: boolean;
}

export const routes: NavigationRoute[] = [
  { name: 'Login', label: 'Sign In', icon: 'log-in', requiresAuth: false },
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid', requiresAuth: true },
  { name: 'Profile', label: 'Profile', icon: 'user', requiresAuth: true },
];

export interface NavigationState {
  currentScreen: ScreenName;
  history: ScreenName[];
}

export function createNavigationState(): NavigationState {
  return { currentScreen: 'Login', history: ['Login'] };
}

export function navigate(state: NavigationState, screen: ScreenName): NavigationState {
  return {
    currentScreen: screen,
    history: [...state.history, screen],
  };
}

export function goBack(state: NavigationState): NavigationState {
  const newHistory = state.history.slice(0, -1);
  const previous = newHistory[newHistory.length - 1] ?? 'Login';
  return { currentScreen: previous, history: newHistory };
}

export function BottomTabBar(props: {
  current: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}): JSX.Element {
  const authRoutes = routes.filter((r) => r.requiresAuth);
  return (
    <nav className="flex border-t bg-white">
      {authRoutes.map((route) => (
        <button
          key={route.name}
          className={`flex-1 py-3 text-center text-xs ${
            route.name === props.current ? 'font-semibold text-indigo-600' : 'text-neutral-400'
          }`}
          onClick={() => props.onNavigate(route.name)}
        >
          {route.label}
        </button>
      ))}
    </nav>
  );
}
