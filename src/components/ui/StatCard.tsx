import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'forest' | 'emerald' | 'amber' | 'rose' | 'slate';
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = 'forest',
  onClick,
}) => {
  const badgeClasses: Record<string, string> = {
    forest: 'bg-forest-50 dark:bg-forest-950/80 text-forest-700 dark:text-forest-300 border-forest-200 dark:border-forest-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#0E1A16] rounded-2xl p-5 border border-slate-200/80 dark:border-forest-900/40 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group${onClick ? ' cursor-pointer hover:border-forest-400 dark:hover:border-forest-600 active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h4>
            {badge && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClasses[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-forest-50 dark:bg-forest-950/90 border border-forest-100 dark:border-forest-800/40 flex items-center justify-center text-forest-700 dark:text-forest-400 group-hover:scale-105 group-hover:bg-forest-100 dark:group-hover:bg-forest-900 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-forest-500/0 via-forest-500/40 to-forest-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
