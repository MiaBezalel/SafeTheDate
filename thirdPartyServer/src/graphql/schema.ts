import { createSchema } from "graphql-yoga";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { join } from "path";

const getSchema = async () => {
  const typeDefs = mergeTypeDefs(
    loadFilesSync(join(__dirname, "\\typeDefs\\**\\*.ts"), {
      extensions: ["ts"],
      ignoreIndex: true,
    })
  );

  const resolvers = mergeResolvers(
    await loadFilesSync(join(__dirname, "\\resolvers\\**\\*.ts"))
  );

  return createSchema({
    typeDefs,
    resolvers,
  });
};
export default getSchema;
