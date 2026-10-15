import { ChallengeStatus } from "@/lib/schemas";

interface StatusBadgeProps {
  status: ChallengeStatus;
  className?: string;
}

const statusConfig: Record<
  ChallengeStatus,
  { label: string; classes: string }
> = {
  planned: {
    label: "Planned",
    classes: "bg-surface2 text-muted border-border",
  },
  building: {
    label: "Building",
    classes: "bg-accent-tint text-accent border-accent-border",
  },
  done: {
    label: "Done",
    classes: "bg-primary-glow text-primary border-primary/30",
  },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    classes: "bg-surface2 text-muted border-border",
  };

  return (
    <span
      className={`inline-flex items-center rounded-[6px] border font-mono text-[12px] font-medium px-2.5 py-0.5 leading-tight ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
