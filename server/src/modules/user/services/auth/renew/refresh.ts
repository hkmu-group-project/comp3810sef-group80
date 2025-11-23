import type { User } from "#/modules/user/schema";
import type { RefreshTokenPayload } from "#/utils/jwt-verify/refresh";

import { sign } from "hono/jwt";
import { ObjectId, type WithId } from "mongodb";

import { ACCESS_EXP, REFRESH_EXP } from "#/configs/token";
import { ACCESS_SECRET, REFRESH_SECRET } from "#/constants";
import { findUserByID } from "#/modules/user/sql";
import { verifyRefreshToken } from "#/utils/jwt-verify/refresh";
import { ServiceError } from "#/utils/service-error";

enum ServiceUserRenewRefreshErrorCode {
    INVALID = "invalid",
    NOT_FOUND = "not_found",
}

enum ServiceUserRenewRefreshErrorMessage {
    INVALID = "Invalid refresh token",
    NOT_FOUND = "User not found",
}

const getLoginErrorMessage = (
    code: ServiceUserRenewRefreshErrorCode,
): ServiceUserRenewRefreshErrorMessage => {
    switch (code) {
        case ServiceUserRenewRefreshErrorCode.INVALID:
            return ServiceUserRenewRefreshErrorMessage.INVALID;
        case ServiceUserRenewRefreshErrorCode.NOT_FOUND:
            return ServiceUserRenewRefreshErrorMessage.NOT_FOUND;
    }
};

type ServiceUserRenewRefreshOptions = {
    refresh?: string;
};

type ServiceUserRenewRefreshResult = {
    id: string;
    name: string;
    refresh: string;
    access: string;
};

const serviceUserRenewRefresh = async (
    options: ServiceUserRenewRefreshOptions,
): Promise<ServiceUserRenewRefreshResult> => {
    const payload: RefreshTokenPayload | undefined = await verifyRefreshToken(
        options.refresh,
    );

    if (!payload) {
        const code: ServiceUserRenewRefreshErrorCode =
            ServiceUserRenewRefreshErrorCode.INVALID;

        throw new ServiceError(code)
            .setStatus(401)
            .setMessage(getLoginErrorMessage(code));
    }

    // refetch data

    const user: WithId<User> | null = await findUserByID(
        new ObjectId(payload.id),
    );

    if (!user) {
        const code: ServiceUserRenewRefreshErrorCode =
            ServiceUserRenewRefreshErrorCode.NOT_FOUND;

        throw new ServiceError(code)
            .setStatus(404)
            .setMessage(getLoginErrorMessage(code));
    }

    const newPayload = {
        id: user._id.toString(),
        name: user.name,
        iat: Date.now() / 1000,
    } as const;

    const refresh: string = await sign(
        {
            ...newPayload,
            exp: (Date.now() + REFRESH_EXP) / 1000,
        },
        REFRESH_SECRET,
    );

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
        refresh,
        access,
    };
};

export type { ServiceUserRenewRefreshOptions, ServiceUserRenewRefreshResult };
export {
    ServiceUserRenewRefreshErrorCode,
    ServiceUserRenewRefreshErrorMessage,
    serviceUserRenewRefresh,
};
