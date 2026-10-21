export type ErrorMap = Readonly<Partial<Record<string, string>>>;

type ValidationIssue = {
  readonly path: ReadonlyArray<PropertyKey>;
  readonly message: string;
};

export const NO_ERRORS: ErrorMap = {};

export function buildErrorMap(issues: ReadonlyArray<ValidationIssue>): ErrorMap {
  return issues.reduce<ErrorMap>((errors, issue) => {
    const key = issue.path.map(String).join('.');
    return key in errors ? errors : { ...errors, [key]: issue.message };
  }, NO_ERRORS);
}

export function selectNestedErrors(errors: ErrorMap, prefix: string): ErrorMap {
  const keyPrefix = `${prefix}.`;
  return Object.fromEntries(
    Object.entries(errors)
      .filter(([key]) => key.startsWith(keyPrefix))
      .map(([key, message]) => [key.slice(keyPrefix.length), message]),
  );
}
