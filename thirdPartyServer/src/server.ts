const express = require("express");
const cors = require("cors");

import { createYoga } from "graphql-yoga";
import getSchema from "./graphql/schema";
import settings from "./config/settings";
import setUpMongo from "../mongo/mongoDbManager";

(async () => {
  // Create a Yoga instance with a GraphQL schema.
  const yoga = createYoga({ schema: await getSchema() });

  setUpMongo();
  let app;
  console.log(process.env.IS_DEVELOPMENT === "true" ? "dev mode" : "prod mode");
  if (process.env.IS_DEVELOPMENT === "false") {
    const https = require("https");
    const fs = require("fs");
    const options = {
      key: fs.readFileSync("../../../../etc/ssl/myserver.key"),
      cert: fs.readFileSync("../../../../etc/ssl/cs.crt"),
    };
    app = https.createServer(options, yoga);
  } else {
    const http = require("http");
    app = http.createServer(yoga);
  }

  // Start the server and you're done!
  app.listen(settings.port);
  console.log(
    `Running a GraphQL API server at http://localhost:${settings.port}/graphql`
  );
})();
