type ErrorStateProps = Readonly<{
  title: string;
  description: string;
  onRetry?: () => void;
  reference?: string;
}>;

export function ErrorState({
  title,
  description,
  onRetry,
  reference,
}: ErrorStateProps) {
  return (
    <section className="error-state" role="alert">
      <h1>{title}</h1>
      <p>{description}</p>
      {reference ? <p>Reference: {reference}</p> : null}
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </section>
  );
}
