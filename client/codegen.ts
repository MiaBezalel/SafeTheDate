import { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config()

const config: CodegenConfig = {
  schema: process.env.REACT_APP_BACKEND_URL + "/graphql",
  documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true,
  generates: {
    "./src/graphql/": {
      preset: "client",
    },
  },
};

export default config;
