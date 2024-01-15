import BaseError from './base-error';

export default class ResourceNotFoundError extends BaseError {
  constructor(resourceName: string, id: string) {
    const upperCase = resourceName.toUpperCase();
    const camelCase =
      resourceName.charAt(0).toUpperCase() +
      resourceName.toLowerCase().slice(1);

    super({
      statusCode: 404,
      code: `${upperCase}_NOT_FOUND`,
      message: `Could not find ${camelCase} with id of ${id}`,
      action: 'Make sure the id is correct and try again',
    });
  }
}
