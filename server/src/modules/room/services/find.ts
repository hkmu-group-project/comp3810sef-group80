import type { WithId } from "mongodb";

import type { WithStringId } from "#/@types/schema";
import type { Room } from "#/modules/room/schema";

import { ObjectId } from "mongodb";

import { findRoomByID } from "#/modules/room/sql";
import { ServiceError } from "#/utils/service-error";

enum ServiceRoomFindErrorCode {
    NOT_FOUND = "not_found",
}

enum ServiceRoomFindErrorMessage {
    NOT_FOUND = "User not found",
}

const getErrorMessage = (
    code: ServiceRoomFindErrorCode,
): ServiceRoomFindErrorMessage => {
    switch (code) {
        case ServiceRoomFindErrorCode.NOT_FOUND:
            return ServiceRoomFindErrorMessage.NOT_FOUND;
    }
};

type ServiceRoomFindOptions = {
    id: string;
};

const serviceRoomFind = async (
    options: ServiceRoomFindOptions,
): Promise<WithStringId<Room>> => {
    // find room

    const room: WithId<Room> | null = await findRoomByID(
        new ObjectId(options.id),
    );

    if (!room) {
        const code: ServiceRoomFindErrorCode =
            ServiceRoomFindErrorCode.NOT_FOUND;

        throw new ServiceError(code)
            .setStatus(404)
            .setMessage(getErrorMessage(code));
    }

    return {
        id: room._id.toString(),
        ownerId: room.ownerId,
        name: room.name,
        description: room.description,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
    };
};

export type { ServiceRoomFindOptions };
export {
    ServiceRoomFindErrorCode,
    ServiceRoomFindErrorMessage,
    serviceRoomFind,
};
