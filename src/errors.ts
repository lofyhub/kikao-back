// errors.ts

export class NotFoundError extends Error {
    detail?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = 'NotFoundError';
        this.detail = details;
        Error.captureStackTrace(this, NotFoundError);
    }
}

export class UpdateFailedError extends Error {
    detail?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = 'UpdateFailedError';
        this.detail = details;
        Error.captureStackTrace(this, UpdateFailedError);
    }
}

export class DeleteFailedError extends Error {
    details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = 'DeleteFailedError';
        this.details = details;
        Error.captureStackTrace(this, UpdateFailedError);
    }
}
export class UnauthorizedError extends Error {
    details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = 'UnauthorizedError';
        this.details = details;
        Error.captureStackTrace(this, UnauthorizedError);
    }
}

export class GenericError extends Error {
    details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = 'GenericError';
        this.details = details;
        Error.captureStackTrace(this, GenericError);
    }
}
export class CloudinaryError extends Error {
    details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = 'CloudinaryError';
        this.details = details;
        Error.captureStackTrace(this, CloudinaryError);
    }
}

export class ValidationError extends Error {
    details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
        Error.captureStackTrace(this, ValidationError);
    }
}

export const validationMessage = 'Validation error occured!';

export enum ErrorCodes {
    APIError = 'APIError',
    PGError = 'PError',
    MULTERError = 'MTError',
    ServerError = 'SError',
    VALIDError = 'VDError'
}
