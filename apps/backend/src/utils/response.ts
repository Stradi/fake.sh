import type { ErrorProperties } from './errors/base-error';

export type SuccessResponseData = {
  message: string;
  payload?: unknown;
};

export type ErrorResponseData = Omit<ErrorProperties, 'statusCode'>;

export type ResponseData = SuccessResponseData | ErrorResponseData;

function isErrorResponse(options: ResponseData): options is ErrorResponseData {
  return 'code' in options;
}

export function resp(options: ResponseData) {
  if (isErrorResponse(options)) {
    return {
      success: false,
      data: null,
      error: options,
    };
  }

  return {
    success: true,
    data: options,
    error: null,
  };
}
