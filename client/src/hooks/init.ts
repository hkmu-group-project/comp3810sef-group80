import * as React from "react";
import { renewAccess } from "#/openapi";
import { useUserStore } from "#/stores/user";

type Identity = {
    accessToken: string;
    refreshToken: string;
};

export const useInit = () => {
    const { setUser, setToken } = useUserStore();

    React.useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Check for existing token in localStorage
                const token = localStorage.getItem('token');
                if (token) {
                    // TODO: Validate token and get user data
                    // const userData = await renewAccess();
                    // setUser(userData);
                    // setToken(token);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                localStorage.removeItem('token');
            }
        };

        initializeAuth();
    }, [setUser, setToken]);

    return null;
};
