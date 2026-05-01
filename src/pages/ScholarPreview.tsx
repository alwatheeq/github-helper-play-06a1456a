import React, { useState } from 'react';
import { Sparkles, Search, Trash2, Bell } from 'lucide-react';
import {
  ScholarCard,
  ScholarButton,
  ScholarIconButton,
  ScholarInput,
  ScholarTextarea,
  ScholarSelect,
  ScholarBadge,
  ScholarChip,
  ScholarSpinner,
  ScholarDivider,
  ScholarAlert,
  ScholarSkeleton,
} from '../components/Scholar';
import { useTheme, ColorTheme, VALID_COLOR_THEMES } from '../contexts/ThemeContext';

const ScholarPreview: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark')
  );
  const [loading, setLoading] = useState(false);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('meshfahem_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('meshfahem_theme', 'light');
    }
    window.dispatchEvent(new Event('themeChanged'));
  };

  return (
    <div className="min-h-screen bg-page text-ink dark:text-ink-on-dark p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="eyebrow text-accent-gold">Scholar Redesign</p>
          <h1 className="font-display text-3xl">Primitive Preview</h1>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark text-sm">
            Visual QA surface for Phase 2 primitives across all 6 themes × light/dark.
          </p>
        </header>

        <ScholarCard padding="md" className="flex flex-wrap items-center gap-3">
          <span className="eyebrow text-muted-ink dark:text-muted-ink-on-dark mr-2">Theme</span>
          {VALID_COLOR_THEMES.map((t: ColorTheme) => (
            <ScholarButton
              key={t}
              size="sm"
              variant={t === currentTheme ? 'primary' : 'secondary'}
              onClick={() => setTheme(t)}
            >
              {t}
            </ScholarButton>
          ))}
          <span className="flex-1" />
          <ScholarButton size="sm" variant="ghost" onClick={toggleDark}>
            {isDark ? 'Light mode' : 'Dark mode'}
          </ScholarButton>
        </ScholarCard>

        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScholarCard><p className="text-sm">Default</p></ScholarCard>
            <ScholarCard variant="elevated"><p className="text-sm">Elevated</p></ScholarCard>
            <ScholarCard variant="flat"><p className="text-sm">Flat</p></ScholarCard>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <ScholarButton>Primary</ScholarButton>
            <ScholarButton variant="secondary">Secondary</ScholarButton>
            <ScholarButton variant="ghost">Ghost</ScholarButton>
            <ScholarButton variant="danger">Danger</ScholarButton>
            <ScholarButton icon={<Sparkles className="h-4 w-4" />}>With icon</ScholarButton>
            <ScholarButton
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
            >
              Click to load
            </ScholarButton>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <ScholarButton size="sm">sm</ScholarButton>
            <ScholarButton size="md">md</ScholarButton>
            <ScholarButton size="lg">lg</ScholarButton>
          </div>
        </Section>

        <Section title="Icon buttons">
          <div className="flex flex-wrap gap-3 items-center">
            <ScholarIconButton aria-label="Search" icon={<Search className="h-4 w-4" />} />
            <ScholarIconButton aria-label="Delete" variant="outline" icon={<Trash2 className="h-4 w-4" />} />
            <ScholarIconButton aria-label="Notify" variant="solid" icon={<Bell className="h-4 w-4" />} />
            <ScholarIconButton aria-label="Search" size="sm" icon={<Search className="h-3.5 w-3.5" />} />
            <ScholarIconButton aria-label="Search" size="lg" icon={<Search className="h-5 w-5" />} />
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScholarInput id="name" label="Name" placeholder="Jane Doe" helperText="Your full name" />
            <ScholarInput id="email" label="Email" placeholder="you@example.com" errorText="Required" />
            <ScholarTextarea id="bio" label="Bio" placeholder="Tell us…" rows={3} />
            <ScholarSelect id="role" label="Role">
              <option>Student</option>
              <option>Teacher</option>
            </ScholarSelect>
          </div>
        </Section>

        <Section title="Badges & Chips">
          <div className="flex flex-wrap gap-2">
            <ScholarBadge>Default</ScholarBadge>
            <ScholarBadge variant="accent">Accent</ScholarBadge>
            <ScholarBadge variant="success">Success</ScholarBadge>
            <ScholarBadge variant="warn">Warn</ScholarBadge>
            <ScholarBadge variant="danger">Danger</ScholarBadge>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <ScholarChip removable onRemove={() => undefined}>React</ScholarChip>
            <ScholarChip variant="accent" removable onRemove={() => undefined}>TypeScript</ScholarChip>
          </div>
        </Section>

        <Section title="Spinner">
          <div className="flex items-center gap-4">
            <ScholarSpinner size="sm" />
            <ScholarSpinner size="md" />
            <ScholarSpinner size="lg" />
            <ScholarSpinner size="xl" />
          </div>
        </Section>

        <Section title="Divider">
          <ScholarDivider />
          <ScholarDivider label="Or" />
        </Section>

        <Section title="Alerts">
          <div className="space-y-3">
            <ScholarAlert variant="info" title="Heads up">Informational message.</ScholarAlert>
            <ScholarAlert variant="success" title="Saved">Changes saved successfully.</ScholarAlert>
            <ScholarAlert variant="warn" title="Careful">Double-check before submitting.</ScholarAlert>
            <ScholarAlert variant="danger" title="Error" onDismiss={() => undefined}>
              Something went wrong.
            </ScholarAlert>
          </div>
        </Section>

        <Section title="Skeleton">
          <ScholarSkeleton height={20} count={3} />
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="font-display text-xl">{title}</h2>
    <ScholarCard padding="md">{children}</ScholarCard>
  </section>
);

export default ScholarPreview;
