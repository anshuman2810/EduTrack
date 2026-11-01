import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export const GradeBadge = ({ grade }) => {
  const getVariant = (g) => {
    switch (g) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B+':
      case 'B':
        return 'primary';
      case 'C':
        return 'warning';
      case 'D':
      case 'F':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(grade)} size="sm" className="font-bold">
      Grade {grade}
    </Badge>
  );
};

export const StatusBadge = ({ status }) => {
  const getVariant = (s) => {
    switch (s?.toLowerCase()) {
      case 'active':
      case 'present':
      case 'enrolled':
      case 'promoted':
      case 'pass':
      case 'replied':
        return 'success';
      case 'late':
      case 'pending':
        return 'warning';
      case 'absent':
      case 'fail':
      case 'detained':
      case 'suspended':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)} size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </Badge>
  );
};
