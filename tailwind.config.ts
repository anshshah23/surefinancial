import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#0f172a',
        'navy-light': '#1e293b',
        'navy-lighter': '#334155',
        'cyan': '#06b6d4',
        'cyan-light': '#22d3ee',
        'purple': '#7c3aed',
        'purple-dark': '#6d28d9',
        'coral': '#f87171',
        'coral-light': '#fb7185',
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'gradient-cyan-purple': 'linear-gradient(90deg, #06b6d4 0%, #7c3aed 100%)',
        'gradient-purple-coral': 'linear-gradient(135deg, #7c3aed 0%, #f87171 100%)',
        'gradient-subtle-cyan': 'linear-gradient(135deg, rgba(6,182,212,0.1), transparent)',
        'gradient-subtle-purple': 'linear-gradient(135deg, rgba(124,58,237,0.1), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6,182,212,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(6,182,212,0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
