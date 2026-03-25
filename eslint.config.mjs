import nextVitals from "eslint-config-next/core-web-vitals";

const ignoreConfig = {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**"],
};

const eslintConfig = [...nextVitals, ignoreConfig];

export default eslintConfig;
