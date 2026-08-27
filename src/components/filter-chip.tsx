"use client";

import { startTransition } from "react";

export interface FilterChipProps<T extends string = string> {
  label: string;
  selected: boolean;
  onSelect: () => void;
  value: T;
  disabled?: boolean;
  ariaLabel?: string;
}

export function FilterChip<T extends string = string>({
  label,
  selected,
  onSelect,
  disabled = false,
  ariaLabel,
}: FilterChipProps<T>) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      onClick={onSelect}
      disabled={disabled}
      className="filter-chip font-mono text-[10px] tracking-wider px-2.5 py-1.5 min-h-[32px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      style={{
        backgroundColor: selected ? "var(--color-accent-dim)" : "transparent",
        color: selected ? "var(--color-accent)" : disabled ? "var(--color-text-dim)" : "var(--color-text-dim)",
        borderColor: selected ? "var(--color-accent-border)" : "var(--color-border)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label.toUpperCase()}
    </button>
  );
}

export interface FilterChipGroupProps<T extends string = string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  useStartTransition?: boolean;
}

export function FilterChipGroup<T extends string = string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  useStartTransition = false,
}: FilterChipGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-2 flex-wrap">
      <span
        aria-hidden="true"
        className="filter-chip-label font-mono text-[10px] tracking-widest uppercase shrink-0"
        style={{ color: "var(--color-text-dim)" }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <FilterChip
            key={o.value}
            label={o.label}
            value={o.value}
            selected={value === o.value}
            onSelect={() => (useStartTransition ? startTransition(() => onChange(o.value)) : onChange(o.value))}
            disabled={disabled}
            ariaLabel={`${label}: ${o.label}`}
          />
        ))}
      </div>
    </div>
  );
}