declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

type Screen = 'login' | 'dashboard' | 'profile';

interface AppState {
  currentScreen: Screen;
  isAuthenticated: boolean;
}

/**
 * Root mobile application component.
 * Renders the appropriate screen based on authentication and navigation state.
 */
export function App(): JSX.Element {
  const state: AppState = {
    currentScreen: 'login',
    isAuthenticated: false,
  };

  const activeScreen = state.isAuthenticated ? state.currentScreen : 'login';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-indigo-600 px-4 py-3 text-white">
        <span className="text-lg font-bold">Acme Mobile</span>
      </header>
      <main className="flex-1 p-4">
        <p>Screen: {activeScreen}</p>
      </main>
    </div>
  );
}
