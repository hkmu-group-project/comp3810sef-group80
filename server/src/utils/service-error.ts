import type { JsonResponseError } from "@jderstd/hono/response";
import type { StatusCode } from "hono/utils/http-status";

import { createJsonResponse } from "@jderstd/hono/response";

class ServiceError extends Error {
    protected status: StatusCode = 500;
    protected code: string = "";
    protected path: string[] = [];

    constructor(code: string) {
        super(code);
        this.setCode(code);
    }

    public setStatus(status: StatusCode): ServiceError {
        this.status = status;
        return this;
    }

    public getStatus(): StatusCode {
        return this.status;
    }

    public setCode(code: string): ServiceError {
        this.code = code;
        return this;
    }

    public getCode(): string {
        return this.code;
    }

    public setPath(path: string[]): ServiceError {
        this.path = path;
        return this;
    }

    public getPath(): string[] {
        return this.path;
    }

    public setMessage(message: string): ServiceError {
        this.message = message;
        return this;
    }

    public getMessage(): string {
        return this.message;
    }

    public toJsonResponseError(): JsonResponseError {
        return {
            code: this.getCode(),
            path: this.getPath(),
            message: this.getMessage(),
        };
    }

    public toJsonResponse(): Response {
        return createJsonResponse({
            status: this.getStatus(),
            errors: [
                this.toJsonResponseError(),
            ],
        });
    }
}

const SERVICE_ERROR_UNKNOWN_CODE = "unknown" as const;

const SERVICE_ERROR_UNKNOWN_MESSAGE = "Unknown error" as const;

const routerErrorHandler = (error: unknown): Response => {
    if (error instanceof ServiceError) {
        return error.toJsonResponse();
    }

    return createJsonResponse({
        status: 500,
        errors: [
            {
                code: SERVICE_ERROR_UNKNOWN_CODE,
                message: SERVICE_ERROR_UNKNOWN_MESSAGE,
            },
        ],
    });
};

export {
    SERVICE_ERROR_UNKNOWN_CODE,
    SERVICE_ERROR_UNKNOWN_MESSAGE,
    ServiceError,
    routerErrorHandler,
};
