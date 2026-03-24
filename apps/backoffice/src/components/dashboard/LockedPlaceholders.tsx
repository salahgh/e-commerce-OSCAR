import React from 'react';
import { Lock } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

// Permission-locked placeholder for sections
export const LockedSection: React.FC<{
  title: string;
  permission: string;
  className?: string;
}> = ({ title, permission, className = '' }) => (
  <div
    className={`bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground ${className}`}
  >
    <Lock className="h-12 w-12 mb-3 opacity-50" />
    <p className="font-medium">{title}</p>
    <p className="text-sm mt-1">Permission requise: {permission}</p>
  </div>
);

// Locked KPI Card placeholder
export const LockedKPICard: React.FC<{ title: string; permission: string }> = ({
  title,
  permission,
}) => (
  <Tooltip content={<p className="text-sm">Permission requise: {permission}</p>}>
    <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center min-h-[140px] text-muted-foreground opacity-60">
      <Lock className="h-8 w-8 mb-2" />
      <p className="text-sm font-medium">{title}</p>
    </div>
  </Tooltip>
);

// Locked Quick Action placeholder
export const LockedQuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  permission: string;
  bgColor: string;
  borderColor: string;
}> = ({ icon, label, permission, bgColor, borderColor }) => (
  <Tooltip content={<p className="text-sm">Permission requise: {permission}</p>}>
    <div
      className={`flex flex-col items-center p-4 ${bgColor} rounded-xl border ${borderColor} opacity-50 cursor-not-allowed`}
    >
      {icon}
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  </Tooltip>
);
