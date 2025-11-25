import type { WithId } from "mongodb";

import type { Room } from "#/modules/room/schema";
import type { AccessTokenPayload } from "#/utils/jwt-verify/access";

import { ObjectId } from "mongodb";

import { deleteRoom, findRoomByID } from "#/modules/room/sql";
import { verifyAccessToken } from "#/utils/jwt-verify/access";
import { ServiceError } from "#/utils/service-error";

enum ServiceRoomDeleteErrorCode {
    INVALID = "invalid",
    NOT_FOUND = "not_found",
    FORBIDDEN = "forbidden",
}

enum ServiceRoomDeleteErrorMessage {
    INVALID = "Invalid access token",
    NOT_FOUND = "Room not found",
    FORBIDDEN = "Forbidden access",
}

const getErrorMessage = (
    code: ServiceRoomDeleteErrorCode,
): ServiceRoomDeleteErrorMessage => {
    switch (code) {
        case ServiceRoomDeleteErrorCode.INVALID:
            return ServiceRoomDeleteErrorMessage.INVALID;
        case ServiceRoomDeleteErrorCode.NOT_FOUND:
            return ServiceRoomDeleteErrorMessage.NOT_FOUND;
        case ServiceRoomDeleteErrorCode.FORBIDDEN:
            return ServiceRoomDeleteErrorMessage.FORBIDDEN;
    }
};

type ServiceRoomDeleteOptions = {
    access?: string;
    id: string;
};

const serviceRoomDelete = async (
    options: ServiceRoomDeleteOptions,
): Promise<void> => {
    const payload: AccessTokenPayload | undefined = await verifyAccessToken(
        options.access,
    );

    if (!payload) {
        const code: ServiceRoomDeleteErrorCode =
            ServiceRoomDeleteErrorCode.INVALID;

        throw new ServiceError(code)
            .setStatus(401)
            .setMessage(getErrorMessage(code));
    }

    // find room
    const room: WithId<Room> | null = await findRoomByID(
        new ObjectId(options.id),
    );

    if (!room) {
        const code: ServiceRoomDeleteErrorCode =
            ServiceRoomDeleteErrorCode.NOT_FOUND;

        throw new ServiceError(code)
            .setStatus(404)
            .setMessage(getErrorMessage(code));
    }

    if (room.ownerId.toString() !== payload.id) {
        const code: ServiceRoomDeleteErrorCode =
            ServiceRoomDeleteErrorCode.FORBIDDEN;

        throw new ServiceError(code)
            .setStatus(403)
            .setMessage(getErrorMessage(code));
    }

    await deleteRoom(new ObjectId(options.id));
};

export type { ServiceRoomDeleteOptions };
export {
    ServiceRoomDeleteErrorCode,
    ServiceRoomDeleteErrorMessage,
    serviceRoomDelete,
};
