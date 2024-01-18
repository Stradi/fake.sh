import { BaseError } from '@fake.sh/backend-common';

export type RequestInfo = {
  version: string;
  resource: string;
  identifier?: number;
};

export function extractRequestInfo(path: string) {
  const normalizedPath = path.replace('/api', '');
  const [version, resource, identifier, ...rest] = normalizedPath
    .split('/')
    .filter(Boolean);

  if (identifier) {
    const parsedIdentifier = Number(identifier);
    if (isNaN(parsedIdentifier)) {
      throw new BaseError({
        code: 'INVALID_IDENTIFIER',
        message: `Invalid identifier`,
        action: `The identifier must be a number`,
        statusCode: 400,
      });
    }
  }

  return {
    version,
    resource,
    identifier: identifier ? Number(identifier) : undefined,
    rest: rest.length === 0 ? undefined : rest,
  } as RequestInfo;
}
