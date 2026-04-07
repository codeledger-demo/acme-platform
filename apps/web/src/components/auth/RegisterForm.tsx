import type { RegisterInput } from '@acme/api-client';

export interface RegisterFormProps {
  onSubmit: (input: RegisterInput) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  errors: Record<string, string | undefined>;
}

function validateField(field: string, value: string, state: FormState): string | undefined {
  switch (field) {
    case 'name':
      return value.trim().length < 2 ? 'Name must be at least 2 characters' : undefined;
    case 'email':
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : undefined;
    case 'password':
      return value.length < 8 ? 'Password must be at least 8 characters' : undefined;
    case 'confirmPassword':
      return value !== state.password ? 'Passwords do not match' : undefined;
    default:
      return undefined;
  }
}

function validateAll(state: FormState): FormState['errors'] {
  return {
    name: validateField('name', state.name, state),
    email: validateField('email', state.email, state),
    password: validateField('password', state.password, state),
    confirmPassword: validateField('confirmPassword', state.confirmPassword, state),
  };
}

/**
 * Registration form with name, email, password, and confirm-password fields.
 */
export function RegisterForm(props: RegisterFormProps): JSX.Element {
  const { onSubmit, isLoading = false, error } = props;

  const state: FormState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    errors: {},
  };

  const handleSubmit = async (): Promise<void> => {
    const errors = validateAll(state);
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) return;
    await onSubmit({ name: state.name, email: state.email, password: state.password });
  };

  return (
    <form
      className="mx-auto max-w-sm space-y-4"
      onSubmit={(e: { preventDefault: () => void }) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      <h2 className="text-xl font-semibold">Create your account</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-neutral-700">Full name</label>
        <input type="text" className="mt-1 w-full rounded border px-3 py-2" />
        {state.errors['name'] && <p className="mt-1 text-xs text-red-500">{state.errors['name']}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input type="email" className="mt-1 w-full rounded border px-3 py-2" />
        {state.errors['email'] && <p className="mt-1 text-xs text-red-500">{state.errors['email']}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input type="password" className="mt-1 w-full rounded border px-3 py-2" />
        {state.errors['password'] && <p className="mt-1 text-xs text-red-500">{state.errors['password']}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Confirm password</label>
        <input type="password" className="mt-1 w-full rounded border px-3 py-2" />
        {state.errors['confirmPassword'] && (
          <p className="mt-1 text-xs text-red-500">{state.errors['confirmPassword']}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
