interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0F172A] mb-2">{title}</h1>
          {subtitle && (
            <p className="text-xl text-[#475569]">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex items-center justify-center">{action}</div>}
      </div>
    </div>
  );
}