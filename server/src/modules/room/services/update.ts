import type { UpdateResult, WithId } from "mongodb";

import type { AccessTokenPayload } from "#/utils/jwt-verify/access";
import type { Room } from "../schema";

import { ObjectId } from "mongodb";

import { findRoomByID, updateRoom } from "#/modules/room/sql";
import { verifyAccessToken } from "#/utils/jwt-verify/access";
import { ServiceError } from "#/utils/service-error";

enum ServiceRoomUpdateErrorCode {
    INVALID = "invalid",
    NOT_FOUND = "not_found",
    FORBIDDEN = "forbidden",
}

enum ServiceRoomUpdateErrorMessage {
    INVALID = "Invalid access token",
    NOT_FOUND = "Room not found",
    FORBIDDEN = "Forbidden access",
}

const getErrorMessage = (
    code: ServiceRoomUpdateErrorCode,
): ServiceRoomUpdateErrorMessage => {
    switch (code) {
        case ServiceRoomUpdateErrorCode.INVALID:
            return ServiceRoomUpdateErrorMessage.INVALID;
        case ServiceRoomUpdateErrorCode.NOT_FOUND:
            return ServiceRoomUpdateErrorMessage.NOT_FOUND;
        case ServiceRoomUpdateErrorCode.FORBIDDEN:
            return ServiceRoomUpdateErrorMessage.FORBIDDEN;
    }
};

type ServiceRoomUpdateOptions = {
    access?: string;
    id: string;
    name?: string;
    description?: string;
};

const serviceRoomUpdate = async (
    options: ServiceRoomUpdateOptions,
): Promise<UpdateResult<Room>> => {
    const payload: AccessTokenPayload | undefined = await verifyAccessToken(
        options.access,
    );

    if (!payload) {
        const code: ServiceRoomUpdateErrorCode =
            ServiceRoomUpdateErrorCode.INVALID;

        throw new ServiceError(code)
            .setStatus(401)
            .setMessage(getErrorMessage(code));
    }

    // find room
    const room: WithId<Room> | null = await findRoomByID(
        new ObjectId(options.id),
    );

    if (!room) {
        const code: ServiceRoomUpdateErrorCode =
            ServiceRoomUpdateErrorCode.NOT_FOUND;

        throw new ServiceError(code)
            .setStatus(404)
            .setMessage(getErrorMessage(code));
    }

    if (room.ownerId.toString() !== payload.id) {
        const code: ServiceRoomUpdateErrorCode =
            ServiceRoomUpdateErrorCode.FORBIDDEN;

        throw new ServiceError(code)
            .setStatus(403)
            .setMessage(getErrorMessage(code));
    }

    return await updateRoom(new ObjectId(options.id), {
        name: options.name,
        description: options.description,
    });
};

export type { ServiceRoomUpdateOptions };
export {
    ServiceRoomUpdateErrorCode,
    ServiceRoomUpdateErrorMessage,
    serviceRoomUpdate,
};
