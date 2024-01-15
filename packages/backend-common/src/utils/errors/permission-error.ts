import BaseError from './base-error';

export default class PermissionError extends BaseError {
  constructor() {
    super({
      message: 'You are not allowed to perform this action.',
      code: 'PERMISSION_ERROR',
      statusCode: 403,
      action: 'Log in with an account that has the required permissions.',
    });
  }
}
