export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

interface FormState {
  email: string;
  password: string;
  errors: { email?: string; password?: string };
}

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return undefined;
}

function validate(state: FormState): FormState['errors'] {
  return {
    email: validateEmail(state.email),
    password: validatePassword(state.password),
  };
}

/**
 * Login form with client-side validation.
 * Calls `onSubmit` with validated credentials.
 */
export function LoginForm(props: LoginFormProps): JSX.Element {
  const { onSubmit, isLoading = false, error } = props;

  // In a real React app these would be useState calls.
  // For type-checking purposes we declare the shape.
  const state: FormState = { email: '', password: '', errors: {} };

  const handleSubmit = async (): Promise<void> => {
    const errors = validate(state);
    if (errors.email || errors.password) return;
    await onSubmit(state.email, state.password);
  };

  return (
    <form
      className="mx-auto max-w-sm space-y-4"
      onSubmit={(e: { preventDefault: () => void }) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      <h2 className="text-xl font-semibold">Sign in to Acme</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input type="email" className="mt-1 w-full rounded border px-3 py-2" />
        {state.errors.email && <p className="mt-1 text-xs text-red-500">{state.errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input type="password" className="mt-1 w-full rounded border px-3 py-2" />
        {state.errors.password && <p className="mt-1 text-xs text-red-500">{state.errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
