import { Badge } from "@/components/ui/Badge";
import {
  STATUS_META,
  ACTIVITY_META,
  type ProjectStatus,
  type ProjectActivity,
} from "@/lib/project-status";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function ActivityBadge({ activity }: { activity: ProjectActivity }) {
  const meta = ACTIVITY_META[activity];
  return (
    <Badge tone={meta.tone}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  );
}
