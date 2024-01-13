export type RequestInfo = {
  version: string;
  resource: string;
  identifier?: string;
};

export function extractRequestInfo(path: string) {
  const normalizedPath = path.replace('/api', '');
  const [version, resource, identifier, ...rest] = normalizedPath
    .split('/')
    .filter(Boolean);

  return {
    version,
    resource,
    identifier,
    rest: rest.length === 0 ? undefined : rest,
  } as RequestInfo;
}
