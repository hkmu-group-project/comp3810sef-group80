/** @type {import("postcss-preset-env").pluginOptions} */
const presetEnvOptions = {
    browsers: "fully supports es6-module",
    features: {
        "custom-properties": false,
    },
};

export default {
    plugins: [
        [
            "postcss-preset-env",
            presetEnvOptions,
        ],
        "postcss-flexbugs-fixes",
        "@tailwindcss/postcss",
    ],
};
