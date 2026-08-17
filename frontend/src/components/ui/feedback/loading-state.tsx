type LoadingStateProps = Readonly<{
  label?: string;
}>;

export function LoadingState({ label = "Loading" }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-label={label}>
      <span className="loading-bar" aria-hidden="true" />
      <span className="loading-bar" aria-hidden="true" />
      <span className="loading-bar" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
