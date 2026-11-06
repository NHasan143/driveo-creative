/** Numbered steps in a row: how a booking or a service works. */
export function StepCards({ steps }: { steps: { title: string; copy: string }[] }) {
  return (
    <ol className="grid gap-5 md:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.title} className="rounded-3xl border border-border p-6 sm:p-7">
          <span className="font-display text-5xl text-primary">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="mt-6 font-display text-xl font-medium">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.copy}</p>
        </li>
      ))}
    </ol>
  );
}
