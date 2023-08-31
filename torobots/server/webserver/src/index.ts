import express from "express";
import path from "path";

const args = process.argv.slice(2);

for (let i = 0; i < args.length; i += 2) {
  const app = express();

  const APP_NAME = args[i];
  const PORT = args[i + 1];
  
  if (!APP_NAME || !PORT) throw { message: "INVALID ARGUMENTS" };

  const BUILD_DIRECTORY = path.join(__dirname, "../../", APP_NAME, "build");

  app.use(express.static(BUILD_DIRECTORY));

  app.get("/*", function (req, res) {
    res.sendFile(path.join(BUILD_DIRECTORY, "index.html"));
  });

  app.listen(PORT,()=>{
    console.log("successfully started",APP_NAME,"on port",PORT);
  });
}
