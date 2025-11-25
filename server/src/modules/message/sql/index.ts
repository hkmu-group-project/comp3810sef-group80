import type { DeleteResult, InsertOneResult, ObjectId, WithId } from "mongodb";
import type { Format } from "ts-vista";

import type { Message } from "#/modules/message/schema";

import { message } from "#/modules/message/schema";

type FindMessagesOptions = {
    roomId: ObjectId;
} & (
    | {
          after?: ObjectId;
          first?: number;
          before?: never;
          last?: never;
      }
    | {
          after?: never;
          first?: never;
          before?: ObjectId;
          last?: number;
      }
);

const findMessages = async (
    options: FindMessagesOptions,
): Promise<WithId<Message>[]> => {
    // limit to 100 results at a time
    const limit: number = Math.min(
        100,
        options.first ? options.first : options.last ? options.last : 100,
    );

    const result: WithId<Message>[] = await message
        .find({
            roomId: options.roomId,
            ...(options.after && {
                _id: {
                    $gt: options.after,
                },
            }),
            ...(options.before && {
                _id: {
                    $lt: options.before,
                },
            }),
        })
        .sort({
            _id: options.last ? -1 : 1,
        })
        .limit(limit)
        .toArray();

    if (options.last) {
        return result.reverse();
    }

    return result;
};

type CreateRoomData = Format<Pick<Message, "roomId" | "sender" | "content">>;

const createMessage = async (
    data: CreateRoomData,
): Promise<InsertOneResult<Message>> => {
    return await message.insertOne({
        roomId: data.roomId,
        sender: data.sender,
        content: data.content,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};

const deleteMessage = async (id: ObjectId): Promise<DeleteResult> => {
    return await message.deleteOne({
        _id: id,
    });
};

export type { FindMessagesOptions, CreateRoomData };
export { findMessages, createMessage, deleteMessage };
