import next from "eslint-config-next";

const config = [
  { ignores: [".next/**", "node_modules/**", "data/**", "out/**"] },
  ...next,
];

export default config;
