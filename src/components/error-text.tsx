type ErrorTextProps = {
  readonly message?: string;
};

export function ErrorText({ message }: ErrorTextProps) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}
