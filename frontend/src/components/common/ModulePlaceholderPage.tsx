export function ModulePlaceholderPage({ title }: { title: string }) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Este módulo se implementará en las siguientes etapas.
        </p>
      </div>
    </section>
  )
}
