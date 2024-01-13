export type ErrorProperties = {
  statusCode: number;
  message: string;
  code: string;
  action: string;
  additionalData?: unknown;
};

export default class BaseError extends Error {
  constructor(private error: Partial<ErrorProperties>) {
    super();
  }

  public get statusCode() {
    return this.error.statusCode || 500;
  }

  public get message() {
    return this.error.message || 'Unknown Error';
  }

  public get code() {
    return this.error.code || 'UNKNOWN_ERROR';
  }

  public get action() {
    return (
      this.error.action ||
      'To be honest, I have no idea what you should do. Please wait for me to figure it out.'
    );
  }

  public get additionalData() {
    return this.error.additionalData;
  }
}
