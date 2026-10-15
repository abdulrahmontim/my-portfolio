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
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  building: {
    label: "Building",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  done: {
    label: "Done",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    classes: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
