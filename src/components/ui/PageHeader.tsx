interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <p className="label-micro">{eyebrow}</p>
      <h1 className="mt-1 text-4xl font-bold">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
      )}
    </div>
  );
}
