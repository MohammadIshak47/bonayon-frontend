import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        raised: c('surface-raised'),
        subtle: c('border-subtle'),
        text: c('text'),
        muted: c('text-muted'),
        primary: c('primary'),
        'on-primary': c('on-primary'),
        'primary-text': c('primary-text'),
        climate: c('climate'),
        'climate-text': c('climate-text'),
        soil: c('soil'),
        amber: c('risk-amber'),
        'amber-text': c('risk-amber-text'),
        danger: c('danger'),
        'danger-text': c('danger-text'),
        success: c('success'),
        'success-text': c('success-text'),
        focus: c('focus'),
      },
      borderRadius: { control: '8px', card: '12px', panel: '16px' },
      fontFamily: {
        sans: ['Inter', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
      minHeight: { tap: 'var(--tap-min)' },
      minWidth: { tap: 'var(--tap-min)' },
      boxShadow: { card: '0 1px 2px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.04)' },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('farmer', 'html[data-farmer="on"] &');
    }),
  ],
} satisfies Config;
