import type { WithId } from "mongodb";

import type { User } from "#/modules/user/schema";

import { hash } from "@node-rs/argon2";
import { ObjectId } from "mongodb";

import { findUserByID, findUserByName, updateUser } from "#/modules/user/sql";
import {
    type AccessTokenPayload,
    verifyAccessToken,
} from "#/utils/jwt-verify/access";
import { ServiceError } from "#/utils/service-error";

enum ServiceUserUpdateErrorCode {
    UNAUTHORIZED = "unauthorized",
    NOT_FOUND = "not_found",
    FORBIDDEN = "forbidden",
    DUPLICATE = "duplicate",
}

enum ServiceUserUpdateErrorMessage {
    UNAUTHORIZED = "Unauthorized user",
    NOT_FOUND = "User not found",
    FORBIDDEN = "Forbidden access",
    DUPLICATE = "User already exists",
}

const getErrorMessage = (
    code: ServiceUserUpdateErrorCode,
): ServiceUserUpdateErrorMessage => {
    switch (code) {
        case ServiceUserUpdateErrorCode.UNAUTHORIZED:
            return ServiceUserUpdateErrorMessage.UNAUTHORIZED;
        case ServiceUserUpdateErrorCode.NOT_FOUND:
            return ServiceUserUpdateErrorMessage.NOT_FOUND;
        case ServiceUserUpdateErrorCode.FORBIDDEN:
            return ServiceUserUpdateErrorMessage.FORBIDDEN;
        case ServiceUserUpdateErrorCode.DUPLICATE:
            return ServiceUserUpdateErrorMessage.DUPLICATE;
    }
};

type ServiceUserUpdateOptions = {
    access?: string;
    id: string;
    name?: string;
    password?: string;
};

const serviceUserUpdate = async (
    options: ServiceUserUpdateOptions,
): Promise<void> => {
    // check permissions

    const payload: AccessTokenPayload | undefined = await verifyAccessToken(
        options.access,
    );

    if (!payload) {
        const code: ServiceUserUpdateErrorCode =
            ServiceUserUpdateErrorCode.UNAUTHORIZED;

        throw new ServiceError(code)
            .setStatus(401)
            .setMessage(getErrorMessage(code));
    }

    // find user

    const user: WithId<User> | null = await findUserByID(
        new ObjectId(options.id),
    );

    if (!user) {
        const code: ServiceUserUpdateErrorCode =
            ServiceUserUpdateErrorCode.NOT_FOUND;

        throw new ServiceError(code)
            .setStatus(404)
            .setMessage(getErrorMessage(code));
    }

    // check permissions

    if (payload.id !== user._id.toString()) {
        const code: ServiceUserUpdateErrorCode =
            ServiceUserUpdateErrorCode.FORBIDDEN;

        throw new ServiceError(code)
            .setStatus(403)
            .setMessage(getErrorMessage(code));
    }

    // check duplicate

    if (options.name) {
        const duplicate: WithId<User> | null = await findUserByName(
            options.name,
        );

        if (duplicate) {
            const code: ServiceUserUpdateErrorCode =
                ServiceUserUpdateErrorCode.DUPLICATE;

            throw new ServiceError(code)
                .setStatus(409)
                .setMessage(getErrorMessage(code));
        }
    }

    // update user

    await updateUser(user._id, {
        ...(options.name && {
            name: options.name,
        }),
        ...(options.password && {
            password: await hash(options.password),
        }),
    });
};

export {
    ServiceUserUpdateErrorCode,
    ServiceUserUpdateErrorMessage,
    serviceUserUpdate,
};
