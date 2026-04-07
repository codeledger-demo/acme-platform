declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

type Route = 'users' | 'billing' | 'settings';

interface AppState {
  currentRoute: Route;
}

function Navigation(props: { current: Route; onNavigate: (r: Route) => void }): JSX.Element {
  const routes: Route[] = ['users', 'billing', 'settings'];
  return (
    <nav className="flex gap-4 border-b bg-white px-6 py-3">
      <span className="mr-auto text-lg font-bold text-indigo-600">Acme Admin</span>
      {routes.map((route) => (
        <button
          key={route}
          className={`text-sm font-medium capitalize ${
            route === props.current ? 'text-indigo-600' : 'text-neutral-500'
          }`}
          onClick={() => props.onNavigate(route)}
        >
          {route}
        </button>
      ))}
    </nav>
  );
}

export function App(): JSX.Element {
  const state: AppState = { currentRoute: 'users' };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation current={state.currentRoute} onNavigate={(r) => { state.currentRoute = r; }} />
      <main className="mx-auto max-w-6xl p-6">
        <p>Route: {state.currentRoute}</p>
      </main>
    </div>
  );
}
