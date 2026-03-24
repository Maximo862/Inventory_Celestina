import { Button } from "@/components/Button";
import { FaClipboardList } from "react-icons/fa6";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
  showAction?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = <FaClipboardList className="text-8xl text-[#94A3B8]" />,
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="mb-6 text-6xl">{icon}</div>
      <h2 className="text-3xl font-bold text-[#0F172A] mb-3">{title}</h2>
      <p className="text-xl text-[#475569] mb-8 max-w-md">{description}</p>
      {showAction && (
        <Button variant="primary" size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
