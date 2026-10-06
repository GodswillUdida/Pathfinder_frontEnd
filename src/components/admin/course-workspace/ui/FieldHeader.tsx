interface FieldHeaderProps {
  index: string;
  label: string;
  optional?: boolean;
  htmlFor?: string;
  id?: string;
}

export function FieldHeader({ index, label, optional, htmlFor, id }: FieldHeaderProps) {
  return (
    <div className="flex items-baseline justify-between">
      <label
        id={id}
        htmlFor={htmlFor}
        className="flex items-baseline gap-2 text-[13px] font-semibold tracking-tight text-foreground"
      >
        <span className="font-mono text-[11px] tabular-nums text-brand-amber">
          {index}
        </span>
        {label}
      </label>
      {optional && (
        <span className="text-[11px] font-medium text-muted-foreground">
          Optional
        </span>
      )}
    </div>
  );
}
