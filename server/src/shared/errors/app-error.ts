export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = 'Insufficient permissions'): AppError {
    return new AppError(message, HttpStatus.FORBIDDEN);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(`${resource} not found`, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string): AppError {
    return new AppError(message, HttpStatus.CONFLICT);
  }
}
