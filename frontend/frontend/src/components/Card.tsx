interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white border-2 border-[#E2E8F0] rounded-2xl shadow-md p-6 ${className}`}
    >
      {children}
    </div>
  );
}