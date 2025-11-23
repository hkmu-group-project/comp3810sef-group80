import type { WithStringId } from "#/@types/schema";
import type { ProtectedUser } from "#/modules/user/schema";

import { createJsonResponse } from "@jderstd/hono/response";
import { describeRoute, resolver, validator } from "@jderstd/hono-openapi";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";

import {
    createJsonFailureResponseSchema,
    createJsonResponseErrorSchema,
    createJsonSuccessResponseSchema,
    jsonResponseSchema,
} from "#/@types/zod";
import { ACCESS_NAME } from "#/configs/token";
import {
    ServiceUserFindErrorCode,
    ServiceUserFindErrorMessage,
    serviceUserFind,
} from "#/modules/user/services/find";
import {
    ServiceUserUpdateErrorCode,
    ServiceUserUpdateErrorMessage,
    serviceUserUpdate,
} from "#/modules/user/services/update";
import {
    routerErrorHandler,
    SERVICE_ERROR_UNKNOWN_CODE,
    SERVICE_ERROR_UNKNOWN_MESSAGE,
} from "#/utils/service-error";

const router: Hono = new Hono();

const findUserQuery = z.object({
    id: z.optional(z.string()),
    name: z.optional(z.string()),
});

const protectedUserWithStringIdSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

router.get(
    "/",
    validator("query", findUserQuery),
    describeRoute({
        operationId: "findUser",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(
                                protectedUserWithStringIdSchema,
                            ),
                        ),
                    },
                },
            },
            400: {
                description: "Missing ID or name",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(ServiceUserFindErrorCode.MISSING),
                                    z.literal(
                                        ServiceUserFindErrorMessage.MISSING,
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
                                        ServiceUserFindErrorCode.NOT_FOUND,
                                    ),
                                    z.literal(
                                        ServiceUserFindErrorMessage.NOT_FOUND,
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
    async ({ req }): Promise<Response> => {
        try {
            const { id, name } = req.valid("query");

            const user: WithStringId<ProtectedUser> = await serviceUserFind({
                id,
                name,
            });

            return createJsonResponse({
                data: user,
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const updateUserJson = z.object({
    access: z.optional(z.string()),
    id: z.string(),
    name: z.optional(z.string()),
    password: z.optional(z.string()),
});

router.patch(
    "/",
    validator("json", updateUserJson),
    describeRoute({
        operationId: "updateUser",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(jsonResponseSchema),
                    },
                },
            },
            400: {
                description: "Missing JSON payload",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal("parse"),
                                    z.string(),
                                ),
                            ),
                        ),
                    },
                },
            },
            401: {
                description: "Unauthorized user",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserUpdateErrorCode.UNAUTHORIZED,
                                    ),
                                    z.literal(
                                        ServiceUserUpdateErrorMessage.UNAUTHORIZED,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            403: {
                description: "Forbidden access",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceUserUpdateErrorCode.FORBIDDEN,
                                    ),
                                    z.literal(
                                        ServiceUserUpdateErrorMessage.FORBIDDEN,
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
                                        ServiceUserUpdateErrorCode.NOT_FOUND,
                                    ),
                                    z.literal(
                                        ServiceUserUpdateErrorMessage.NOT_FOUND,
                                    ),
                                ),
                            ),
                        ),
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
                                        ServiceUserUpdateErrorCode.DUPLICATE,
                                    ),
                                    z.literal(
                                        ServiceUserUpdateErrorCode.DUPLICATE,
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
            const { access: acs, id, name, password } = c.req.valid("json");

            const access: string | undefined = getCookie(c, ACCESS_NAME) ?? acs;

            await serviceUserUpdate({
                access,
                id,
                name,
                password,
            });

            return createJsonResponse(c);
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

export { router as routerUser };
