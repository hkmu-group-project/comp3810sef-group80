import type { InsertOneResult } from "mongodb";

import type { WithStringId } from "#/@types/schema";
import type { Room } from "#/modules/room/schema";

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
    ServiceRoomCreateErrorCode,
    ServiceRoomCreateErrorMessage,
    serviceRoomCreate,
} from "#/modules/room/services/create";
import {
    ServiceRoomDeleteErrorCode,
    ServiceRoomDeleteErrorMessage,
    serviceRoomDelete,
} from "#/modules/room/services/delete";
import {
    ServiceRoomFindErrorCode,
    ServiceRoomFindErrorMessage,
    serviceRoomFind,
} from "#/modules/room/services/find";
import { serviceRoomFindAll } from "#/modules/room/services/find-all";
import {
    ServiceRoomUpdateErrorCode,
    ServiceRoomUpdateErrorMessage,
    serviceRoomUpdate,
} from "#/modules/room/services/update";
import {
    routerErrorHandler,
    SERVICE_ERROR_UNKNOWN_CODE,
    SERVICE_ERROR_UNKNOWN_MESSAGE,
} from "#/utils/service-error";

const router: Hono = new Hono();

// const findAllRoomsQuery = z.union([
//     z.object({
//         after: z.optional(objectIdSchema),
//         first: z.optional(z.coerce.number()),
//     }),
//     z.object({
//         before: z.optional(objectIdSchema),
//         last: z.optional(z.coerce.number()),
//     }),
// ]);

const findAllRoomsQuery = z.object({
    after: z.optional(objectIdSchema),
    first: z.optional(z.coerce.number()),
    before: z.optional(objectIdSchema),
    last: z.optional(z.coerce.number()),
});

const roomSchema = z.object({
    id: objectIdSchema,
    ownerId: objectIdSchema,
    name: z.string(),
    description: z.optional(z.string()),
    createdAt: z.iso.date(),
    updatedAt: z.iso.date(),
});

router.get(
    "/",
    validator("query", findAllRoomsQuery),
    describeRoute({
        operationId: "findRooms",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(
                                z.array(roomSchema),
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
    async ({ req }): Promise<Response> => {
        try {
            const query = req.valid("query");

            // @ts-expect-error
            const data: WithStringId<Room>[] = await serviceRoomFindAll(query);

            return createJsonResponse<WithStringId<Room>[]>({
                data,
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const findRoomParam = z.object({
    id: z.string(),
});

router.get(
    "/:id",
    validator("param", findRoomParam),
    describeRoute({
        operationId: "findRoom",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(roomSchema),
                        ),
                    },
                },
            },
            400: {
                description: "Invalid params",
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
            404: {
                description: "Room not found",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceRoomFindErrorCode.NOT_FOUND,
                                    ),
                                    z.literal(
                                        ServiceRoomFindErrorMessage.NOT_FOUND,
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
            const { id } = req.valid("param");

            const data: WithStringId<Room> = await serviceRoomFind({
                id,
            });

            return createJsonResponse<WithStringId<Room>>({
                data,
            });
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const createRoomJson = z.object({
    access: z.optional(z.string()),
    name: z.string(),
    description: z.optional(z.string()),
});

router.post(
    "/",
    validator("json", createRoomJson),
    describeRoute({
        operationId: "createRoom",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(
                                z.object({
                                    id: z.string(),
                                }),
                            ),
                        ),
                    },
                },
            },
            400: {
                description: "Invalid JSON",
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
                                        ServiceRoomCreateErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceRoomCreateErrorMessage.INVALID,
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
            const { access: acs, name, description } = c.req.valid("json");

            const access: string | undefined = getCookie(c, ACCESS_NAME) ?? acs;

            const result: InsertOneResult<Room> = await serviceRoomCreate({
                access,
                name,
                description,
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

const updateRoomParams = z.object({
    id: z.string(),
});

const updateRoomJson = z.object({
    access: z.optional(z.string()),
    name: z.optional(z.string()),
    description: z.optional(z.string()),
});

router.patch(
    "/:id",
    validator("param", updateRoomParams),
    validator("json", updateRoomJson),
    describeRoute({
        operationId: "updateRoom",
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
                description: "Invalid JSON",
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
                                        ServiceRoomUpdateErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceRoomUpdateErrorMessage.INVALID,
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
                                        ServiceRoomDeleteErrorCode.FORBIDDEN,
                                    ),
                                    z.literal(
                                        ServiceRoomDeleteErrorMessage.FORBIDDEN,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            404: {
                description: "Room not found",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceRoomDeleteErrorCode.NOT_FOUND,
                                    ),
                                    z.literal(
                                        ServiceRoomDeleteErrorMessage.NOT_FOUND,
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
            const { access: acs, name, description } = c.req.valid("json");

            const access: string | undefined = getCookie(c, ACCESS_NAME) ?? acs;

            await serviceRoomUpdate({
                access,
                id,
                name,
                description,
            });

            return createJsonResponse(c);
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

const deleteRoomParams = z.object({
    id: z.string(),
});

const deleteRoomJson = z.object({
    access: z.optional(z.string()),
});

router.delete(
    "/:id",
    validator("param", deleteRoomParams),
    validator("json", deleteRoomJson),
    describeRoute({
        operationId: "deleteRoom",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonSuccessResponseSchema(jsonResponseSchema),
                        ),
                    },
                },
            },
            400: {
                description: "Invalid params or JSON",
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
                                        ServiceRoomDeleteErrorCode.INVALID,
                                    ),
                                    z.literal(
                                        ServiceRoomDeleteErrorMessage.INVALID,
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
                                        ServiceRoomDeleteErrorCode.FORBIDDEN,
                                    ),
                                    z.literal(
                                        ServiceRoomDeleteErrorMessage.FORBIDDEN,
                                    ),
                                ),
                            ),
                        ),
                    },
                },
            },
            404: {
                description: "Room not found",
                content: {
                    "application/json": {
                        schema: resolver(
                            createJsonFailureResponseSchema(
                                createJsonResponseErrorSchema(
                                    z.literal(
                                        ServiceRoomDeleteErrorCode.NOT_FOUND,
                                    ),
                                    z.literal(
                                        ServiceRoomDeleteErrorMessage.NOT_FOUND,
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
            const { access: acs } = c.req.valid("json");
            const { id } = c.req.valid("param");

            const access: string | undefined = getCookie(c, ACCESS_NAME) ?? acs;

            await serviceRoomDelete({
                access,
                id,
            });

            return createJsonResponse(c);
        } catch (err: unknown) {
            return routerErrorHandler(err);
        }
    },
);

export { router as routerRoom };
