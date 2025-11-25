import type { CookieOptions } from "hono/utils/cookie";

import type { ServiceUserLoginResult } from "#/modules/user/services/auth/login";
import type { ServiceUserRenewAccessResult } from "#/modules/user/services/auth/renew/access";
import type { ServiceUserRenewRefreshResult } from "#/modules/user/services/auth/renew/refresh";

import { createJsonResponse } from "@jderstd/hono/response";
import { describeRoute, resolver, validator } from "@jderstd/hono-openapi";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";

import {
    createJsonFailureResponseSchema,
    createJsonResponseErrorSchema,
    createJsonSuccessResponseSchema,
    jsonResponseSchema,
} from "#/@types/zod";
import {
    ACCESS_EXP,
    ACCESS_NAME,
    REFRESH_EXP,
    REFRESH_NAME,
} from "#/configs/token";
import { IS_PRD } from "#/constants";
import {
    ServiceUserLoginErrorCode,
    ServiceUserLoginErrorMessage,
    serviceUserLogin,
} from "#/modules/user/services/auth/login";
import {
    ServiceUserRegisterErrorCode,
    ServiceUserRegisterErrorMessage,
    serviceUserRegister,
} from "#/modules/user/services/auth/register";
import {
    ServiceUserRenewAccessErrorCode,
    ServiceUserRenewAccessErrorMessage,
    serviceUserRenewAccess,
} from "#/modules/user/services/auth/renew/access";
import {
    ServiceUserRenewRefreshErrorCode,
    ServiceUserRenewRefreshErrorMessage,
    serviceUserRenewRefresh,
} from "#/modules/user/services/auth/renew/refresh";
import {
    routerErrorHandler,
    SERVICE_ERROR_UNKNOWN_CODE,
    SERVICE_ERROR_UNKNOWN_MESSAGE,
} from "#/utils/service-error";

const getRefreshCookieOptions = (): CookieOptions => {
    return {
        domain: "onrender.com",
        expires: new Date(Date.now() + REFRESH_EXP),
        httpOnly: true,
        secure: IS_PRD,
        path: "/",
        sameSite: IS_PRD ? "none" : "lax",
    };
};

const getAccessCookieOptions = (): CookieOptions => {
    return {
        domain: "onrender.com",
        expires: new Date(Date.now() + ACCESS_EXP),
        httpOnly: true,
        secure: IS_PRD,
        path: "/",
        sameSite: IS_PRD ? "none" : "lax",
    };
};

const router: Hono = new Hono();

const registerJson = z.object({
    name: z.string(),
    password: z.string(),
});

router.post(
    "/register",
    validator("json", registerJson),
    describeRoute({
        operationId: "register",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(jsonResponseSchema),
                    },
                },
            },
            409: {
                description: "User already exists",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserRegisterErrorCode.DUPLICATE,
                                    ),
                                    z.literal(
                                        ServiceUserRegisterErrorMessage.DUPLICATE,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            500: {
                description: "Unknown error",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(SERVICE_ERROR_UNKNOWN_CODE),
                                    z.literal(SERVICE_ERROR_UNKNOWN_MESSAGE),
                                ),
                            ),
                        ),
                    },
                },
            },
        },
    }),
    async (c): Promise<Response> => {
        try {
            const { name, password } = c.req.valid("json");

            await serviceUserRegister({
                name,
                password,
            });

            return createJsonResponse(c);
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const loginResultSchema = z.object({
    id: z.string(),
    name: z.string(),
    access: z.string(),
    refresh: z.string(),
});

router.post(
    "/login",
    validator("json", registerJson),
    describeRoute({
        operationId: "login",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(loginResultSchema),
                        ),
                    },
                },
            },
            401: {
                description: "Invalid username of password",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserLoginErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceUserLoginErrorMessage.INVALID,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            500: {
                description: "Unknown error",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(SERVICE_ERROR_UNKNOWN_CODE),
                                    z.literal(SERVICE_ERROR_UNKNOWN_MESSAGE),
                                ),
                            ),
                        ),
                    },
                },
            },
        },
    }),
    async (c): Promise<Response> => {
        try {
            const { name, password } = c.req.valid("json");

            const data: ServiceUserLoginResult = await serviceUserLogin({
                name,
                password,
            });

            setCookie(c, REFRESH_NAME, data.refresh, getRefreshCookieOptions());

            setCookie(c, ACCESS_NAME, data.access, getAccessCookieOptions());

            return createJsonResponse<ServiceUserLoginResult>(c, {
                data,
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const refreshJson = z.object({
    refresh: z.optional(z.string()),
});

const refreshDataJson = z.object({
    id: z.string(),
    name: z.string(),
    refresh: z.string(),
    access: z.string(),
});

router.post(
    "/renew/refresh",
    validator("json", refreshJson),
    describeRoute({
        operationId: "renewRefresh",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(refreshDataJson),
                        ),
                    },
                },
            },
            401: {
                description: "Invalid token",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserRenewRefreshErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceUserRenewRefreshErrorMessage.INVALID,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            404: {
                description: "User not found",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserRenewRefreshErrorCode.NOT_FOUND,
                                    ),
                                    z.literal(
                                        ServiceUserRenewRefreshErrorMessage.NOT_FOUND,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            500: {
                description: "Unknown error",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(SERVICE_ERROR_UNKNOWN_CODE),
                                    z.literal(SERVICE_ERROR_UNKNOWN_MESSAGE),
                                ),
                            ),
                        ),
                    },
                },
            },
        },
    }),
    async (c): Promise<Response> => {
        try {
            const { refresh: rfh } = c.req.valid("json");
            const refresh: string | undefined =
                getCookie(c, REFRESH_NAME) ?? rfh;

            const data: ServiceUserRenewRefreshResult =
                await serviceUserRenewRefresh({
                    refresh,
                });

            setCookie(c, REFRESH_NAME, data.refresh, getRefreshCookieOptions());

            setCookie(c, ACCESS_NAME, data.access, getAccessCookieOptions());

            return createJsonResponse<ServiceUserRenewRefreshResult>(c, {
                data,
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const accessJson = z.object({
    refresh: z.optional(z.string()),
});

const accessDataJson = z.object({
    id: z.string(),
    name: z.string(),
    access: z.string(),
});

router.post(
    "/renew/access",
    validator("json", accessJson),
    describeRoute({
        operationId: "renewAccess",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(accessDataJson),
                        ),
                    },
                },
            },
            401: {
                description: "Invalid token",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserRenewAccessErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceUserRenewAccessErrorMessage.INVALID,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            404: {
                description: "User not found",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserRenewRefreshErrorCode.NOT_FOUND,
                                    ),
                                    z.literal(
                                        ServiceUserRenewRefreshErrorMessage.NOT_FOUND,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            500: {
                description: "Unknown error",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(SERVICE_ERROR_UNKNOWN_CODE),
                                    z.literal(SERVICE_ERROR_UNKNOWN_MESSAGE),
                                ),
                            ),
                        ),
                    },
                },
            },
        },
    }),
    async (c): Promise<Response> => {
        try {
            const { refresh: rfh } = c.req.valid("json");
            const refresh: string | undefined =
                getCookie(c, REFRESH_NAME) ?? rfh;

            const data: ServiceUserRenewAccessResult =
                await serviceUserRenewAccess({
                    refresh,
                });

            setCookie(c, ACCESS_NAME, data.access, getAccessCookieOptions());

            return createJsonResponse<ServiceUserRenewAccessResult>(c, {
                data,
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

router.post(
    "/logout",
    describeRoute({
        operationId: "logout",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(jsonResponseSchema),
                    },
                },
            },
        },
    }),
    async (c): Promise<Response> => {
        try {
            deleteCookie(c, REFRESH_NAME);
            deleteCookie(c, ACCESS_NAME);
            return createJsonResponse(c);
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

export { router as routerAuth };
