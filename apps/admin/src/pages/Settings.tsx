declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
}

export interface SettingsPageProps {
  organizationName?: string;
  onSave?: (section: string, values: Record<string, string>) => Promise<void>;
}

const sections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Organization name, timezone, and default locale.',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Two-factor authentication, session timeout, IP allowlist.',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Email and webhook notification preferences.',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Third-party service connections and API keys.',
  },
];

export function SettingsPage(props: SettingsPageProps): JSX.Element {
  const { organizationName = 'Acme Corp', onSave } = props;

  const handleSave = async (sectionId: string): Promise<void> => {
    if (onSave) {
      await onSave(sectionId, {});
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-neutral-500">
        Manage configuration for <strong>{organizationName}</strong>.
      </p>

      {sections.map((section) => (
        <div key={section.id} className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">{section.title}</h2>
              <p className="mt-1 text-sm text-neutral-500">{section.description}</p>
            </div>
            <button
              className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              onClick={() => void handleSave(section.id)}
            >
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
