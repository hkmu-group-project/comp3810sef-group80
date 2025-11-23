import type { WithId } from "mongodb";

import type { WithStringId } from "#/@types/schema";
import type { Room } from "#/modules/room/schema";
import type { FindRoomsOptions } from "#/modules/room/sql";

import { findRooms } from "#/modules/room/sql";

type ServiceRoomFindAllOptions = FindRoomsOptions;

const serviceRoomFindAll = async (
    options: ServiceRoomFindAllOptions,
): Promise<WithStringId<Room>[]> => {
    const rooms: WithId<Room>[] = await findRooms(options);

    const result: WithStringId<Room>[] = rooms.map(
        (room: WithId<Room>): WithStringId<Room> => ({
            id: room._id.toString(),
            ownerId: room.ownerId,
            name: room.name,
            description: room.description,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
        }),
    );

    return result;
};

export { serviceRoomFindAll };
