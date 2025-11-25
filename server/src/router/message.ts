import type { WithStringId } from "#/@types/schema";
import type { Message } from "#/modules/message/schema";

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
    objectIdSchema,
} from "#/@types/zod";
import { ACCESS_NAME } from "#/configs/token";
import {
    ServiceMessageCreateErrorCode,
    ServiceMessageCreateErrorMessage,
    serviceMessageCreate,
} from "#/modules/message/services/create";
import {
    ServiceMessageDeleteErrorCode,
    ServiceMessageDeleteErrorMessage,
    serviceMessageDelete,
} from "#/modules/message/services/delete";
import { serviceMessageFindAll } from "#/modules/message/services/find-all";
import {
    routerErrorHandler,
    SERVICE_ERROR_UNKNOWN_CODE,
    SERVICE_ERROR_UNKNOWN_MESSAGE,
} from "#/utils/service-error";

const router: Hono = new Hono();

// const findAllMessagesQuery = z.union([
//     z.object({
//         roomId: objectIdSchema,
//         after: z.optional(objectIdSchema),
//         first: z.optional(z.coerce.number()),
//     }),
//     z.object({
//         roomId: objectIdSchema,
//         before: z.optional(objectIdSchema),
//         last: z.optional(z.coerce.number()),
//     }),
// ]);

const findAllMessagesQuery = z.object({
    roomId: objectIdSchema,
    after: z.optional(objectIdSchema),
    first: z.optional(z.coerce.number()),
    before: z.optional(objectIdSchema),
    last: z.optional(z.coerce.number()),
});

const messageSchema = z.object({
    id: objectIdSchema,
    roomId: objectIdSchema,
    sender: objectIdSchema,
    content: z.string(),
    createdAt: z.iso.date(),
    updatedAt: z.iso.date(),
});

router.get(
    "/",
    validator("query", findAllMessagesQuery),
    describeRoute({
        operationId: "findMessages",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(
                                z.array(messageSchema),
                            ),
                        ),
                    },
                },
            },
            400: {
                description: "Invalid query",
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
            const query = c.req.valid("query");

            const data: WithStringId<Message>[] =
                // @ts-expect-error
                await serviceMessageFindAll(query);

            return createJsonResponse<WithStringId<Message>[]>(c, {
                data,
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const createMessageJson = z.object({
    access: z.optional(z.string()),
    roomId: z.string(),
    content: z.string(),
});

const createMessageResult = z.object({
    id: z.string(),
});

router.post(
    "/",
    validator("json", createMessageJson),
    describeRoute({
        operationId: "createMessage",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(
                                z.array(createMessageResult),
                            ),
                        ),
                    },
                },
            },
            400: {
                description: "Invalid query",
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
                description: "Invalid access token",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceMessageCreateErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceMessageCreateErrorMessage.INVALID,
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
            const { access: acs, roomId, content } = c.req.valid("json");

            const access: string | undefined = getCookie(c, ACCESS_NAME) ?? acs;

            const result = await serviceMessageCreate({
                access,
                roomId,
                content,
            });

            return createJsonResponse(c, {
                data: {
                    id: result.insertedId.toString(),
                },
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const deleteMessageParams = z.object({
    id: z.string(),
});

const deleteMessageJson = z.object({
    access: z.optional(z.string()),
});

router.delete(
    "/:id",
    validator("param", deleteMessageParams),
    validator("json", deleteMessageJson),
    describeRoute({
        operationId: "deleteMessage",
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
                description: "Invalid query",
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
                description: "Invalid access token",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceMessageDeleteErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceMessageDeleteErrorMessage.INVALID,
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
            const { id } = c.req.valid("param");
            const { access: acs } = c.req.valid("json");

            const access: string | undefined = getCookie(c, ACCESS_NAME) ?? acs;

            await serviceMessageDelete({
                access,
                id,
            });

            return createJsonResponse(c);
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

export { router as routerMessage };
