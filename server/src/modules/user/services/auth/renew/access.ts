import type { User } from "#/modules/user/schema";
import type { RefreshTokenPayload } from "#/utils/jwt-verify/refresh";

import { sign } from "hono/jwt";
import { ObjectId, type WithId } from "mongodb";

import { ACCESS_EXP } from "#/configs/token";
import { ACCESS_SECRET } from "#/constants";
import { findUserByID } from "#/modules/user/sql";
import { verifyRefreshToken } from "#/utils/jwt-verify/refresh";
import { ServiceError } from "#/utils/service-error";

enum ServiceUserRenewAccessErrorCode {
    INVALID = "invalid",
    NOT_FOUND = "not_found",
}

enum ServiceUserRenewAccessErrorMessage {
    INVALID = "Invalid refresh token",
    NOT_FOUND = "User not found",
}

const getLoginErrorMessage = (
    code: ServiceUserRenewAccessErrorCode,
): ServiceUserRenewAccessErrorMessage => {
    switch (code) {
        case ServiceUserRenewAccessErrorCode.INVALID:
            return ServiceUserRenewAccessErrorMessage.INVALID;
        case ServiceUserRenewAccessErrorCode.NOT_FOUND:
            return ServiceUserRenewAccessErrorMessage.NOT_FOUND;
    }
};

type ServiceUserRenewAccessOptions = {
    refresh?: string;
};

type ServiceUserRenewAccessResult = {
    id: string;
    name: string;
    access: string;
};

const serviceUserRenewAccess = async (
    options: ServiceUserRenewAccessOptions,
): Promise<ServiceUserRenewAccessResult> => {
    const payload: RefreshTokenPayload | undefined = await verifyRefreshToken(
        options.refresh,
    );

    if (!payload) {
        const code: ServiceUserRenewAccessErrorCode =
            ServiceUserRenewAccessErrorCode.INVALID;

        throw new ServiceError(code)
            .setStatus(401)
            .setMessage(getLoginErrorMessage(code));
    }

    // refetch data

    const user: WithId<User> | null = await findUserByID(
        new ObjectId(payload.id),
    );

    if (!user) {
        const code: ServiceUserRenewAccessErrorCode =
            ServiceUserRenewAccessErrorCode.NOT_FOUND;

        throw new ServiceError(code)
            .setStatus(404)
            .setMessage(getLoginErrorMessage(code));
    }

    const newPayload = {
        id: user._id.toString(),
        name: user.name,
        iat: Date.now() / 1000,
    } as const;

    const access: string = await sign(
        {
            ...newPayload,
            exp: (Date.now() + ACCESS_EXP) / 1000,
        },
        ACCESS_SECRET,
    );

    return {
        id: user._id.toString(),
        name: user.name,
        access,
    };
};

export type { ServiceUserRenewAccessOptions, ServiceUserRenewAccessResult };
export {
    ServiceUserRenewAccessErrorCode,
    ServiceUserRenewAccessErrorMessage,
    serviceUserRenewAccess,
};
