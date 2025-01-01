// errors.ts

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
        Error.captureStackTrace(this, NotFoundError);
    }
}

export class UpdateFailedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UpdateFailedError';
        Error.captureStackTrace(this, UpdateFailedError);
    }
}

export class DeleteFailedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DeleteFailedError';
        Error.captureStackTrace(this, UpdateFailedError);
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
        Error.captureStackTrace(this, UnauthorizedError);
    }
}

export class GenericError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GenericError';
        Error.captureStackTrace(this, GenericError);
    }
}
