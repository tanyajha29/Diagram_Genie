import type { ExportColorTheme } from './types';

export class ExportStyleResolver {
  static resolve(theme: 'light' | 'dark' | 'neutral'): ExportColorTheme {
    if (theme === 'dark') {
      return {
        background: '#0B0F19',
        text: '#F8FAFC',
        mutedText: '#94A3B8',
        edge: '#64748B',
        arrow: '#64748B',
        containerBorder: '#334155',
        containerBackground: 'rgba(30, 41, 59, 0.25)',
        cardBackground: '#1E293B',
        cardBorder: '#475569',
        nodeThemes: {
          frontend: { bg: 'rgba(14, 165, 233, 0.1)', border: '#0ea5e9', text: '#F8FAFC', accent: '#38bdf8' },
          backend: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#F8FAFC', accent: '#34d399' },
          database: { bg: 'rgba(99, 102, 241, 0.1)', border: '#6366f1', text: '#F8FAFC', accent: '#818cf8' },
          queue: { bg: 'rgba(139, 92, 246, 0.1)', border: '#8b5cf6', text: '#F8FAFC', accent: '#a78bfa' },
          external: { bg: 'rgba(244, 63, 94, 0.1)', border: '#f43f5e', text: '#F8FAFC', accent: '#fb7185' },
          service: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#F8FAFC', accent: '#34d399' },
          terminal: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#F8FAFC', accent: '#34d399' },
          decision: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#F8FAFC', accent: '#fbbf24' },
          process: { bg: 'rgba(14, 165, 233, 0.1)', border: '#0ea5e9', text: '#F8FAFC', accent: '#38bdf8' },
          class: { bg: '#1E293B', border: '#475569', text: '#F8FAFC', accent: '#94A3B8' },
          interface: { bg: '#1E293B', border: '#475569', text: '#F8FAFC', accent: '#94A3B8' },
          default: { bg: '#1E293B', border: '#475569', text: '#F8FAFC', accent: '#94A3B8' },
        }
      };
    }

    if (theme === 'neutral') {
      return {
        background: '#FFFFFF',
        text: '#000000',
        mutedText: '#555555',
        edge: '#000000',
        arrow: '#000000',
        containerBorder: '#000000',
        containerBackground: 'none',
        cardBackground: '#FFFFFF',
        cardBorder: '#000000',
        nodeThemes: {
          frontend: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          backend: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          database: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          queue: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          external: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          service: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          terminal: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          decision: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          process: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          class: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          interface: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
          default: { bg: '#FFFFFF', border: '#000000', text: '#000000', accent: '#000000' },
        }
      };
    }

    // Default Light Theme
    return {
      background: '#F8FAFC',
      text: '#0F172A',
      mutedText: '#475569',
      edge: '#475569',
      arrow: '#475569',
      containerBorder: '#CBD5E1',
      containerBackground: 'rgba(241, 245, 249, 0.4)',
      cardBackground: '#FFFFFF',
      cardBorder: '#CBD5E1',
      nodeThemes: {
        frontend: { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', accent: '#2563EB' },
        backend: { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', accent: '#16A34A' },
        database: { bg: '#EEF2FF', border: '#4F46E5', text: '#3730A3', accent: '#4338CA' },
        queue: { bg: '#FAF5FF', border: '#9333EA', text: '#6B21A8', accent: '#7E22CE' },
        external: { bg: '#FFF5F5', border: '#EF4444', text: '#991B1B', accent: '#DC2626' },
        service: { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', accent: '#16A34A' },
        terminal: { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', accent: '#16A34A' },
        decision: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', accent: '#D97706' },
        process: { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', accent: '#2563EB' },
        class: { bg: '#FFFFFF', border: '#CBD5E1', text: '#0F172A', accent: '#475569' },
        interface: { bg: '#FFFFFF', border: '#CBD5E1', text: '#0F172A', accent: '#475569' },
        default: { bg: '#FFFFFF', border: '#CBD5E1', text: '#0F172A', accent: '#475569' },
      }
    };
  }
}
