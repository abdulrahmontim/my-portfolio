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
    classes: "text-muted",
  },
  building: {
    label: "Building",
    classes: "text-primary",
  },
  done: {
    label: "Done",
    classes: "text-muted",
  },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    classes: "text-muted",
  };

  return (
    <span
      className={`font-mono text-[12px] font-medium ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
