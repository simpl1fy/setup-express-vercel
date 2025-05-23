#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { input, confirm } = require("@inquirer/prompts");
const { execSync } = require("child_process");

async function setupExpressVercel() {
  /**
   * This takes input on app name from the user
   */
  const projectName = await input({
    message: "Enter project name.",
    default: "express-app",
  });
  const sourceDirectory = ".";
  /**
   * Confirmation to continue
   */
  const installDependencies = await confirm({
    message:
      "Packages to be installed - express, dotenv, body-parser, cors, nodemon",
    default: true,
  });

  const projectDir = path.join(process.cwd(), projectName);
  const sourceDir = projectDir;

  /**
   * Creates the project directory
   */
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
    console.log("Created project directory!\n");
  }

  // if (!fs.existsSync(sourceDir)) {
  //   fs.mkdirSync(sourceDirectory, { recursive: true });
  //   console.log("Created source directory!\n");
  // }

  /**
   * Copy contents of template/server.js to the file
   */
  const serverTemplate = path.join(__dirname, "../template/server.js");
  const serverFile = path.join(sourceDir, "server.js");
  try {
    fs.copyFileSync(serverTemplate, serverFile);
    console.log("\nCreated server.js in source directory!\n");
  } catch (error) {
    console.error("Error copying server.js template:", error);
  }

  /**
   * Add .env file
   */
  const dotEnvContent = `#Add any enviornment variables as needed\n\nPORT="3000"\nFRONTEND_DOMAIN=""`;
  const envPath = path.join(projectDir, ".env");
  fs.writeFileSync(envPath, dotEnvContent);

  /**
   * Add vercel.json file
   */
  const vercelJsonContent = {
    version: 2,
    builds: [
      {
        src: `${path.join(sourceDirectory, "server.js")}`,
        use: "@vercel/node",
      },
    ],
    routes: [
      {
        src: "/(.*)",
        dest: `${path.join(sourceDirectory, "server.js")}`,
      },
    ],
  };
  const vercelJsonFile = path.join(projectDir, "vercel.json");
  fs.writeFileSync(vercelJsonFile, JSON.stringify(vercelJsonContent, null, 2));

  /**
   * Initialize git, in the project dir
   */
  try {
    execSync("git init", { cwd: projectDir, stdio: "inherit" });
  } catch (err) {
    console.error("An error occured while initialing git:", err);
  }

  /**
   * Add .gitignore file
   */
  const gitIgnoreContent = `#Add anything that needs to be ignored here.\nnode_modules/\n.env`;
  const gitIgnoreFile = path.join(projectDir, ".gitignore");
  fs.writeFileSync(gitIgnoreFile, gitIgnoreContent);

  //  Add description
  // entry point will be set
  // git repo
  // keywords
  // author
  // licence isc/mit
  // type commonjs/es
  const description = await input({
    message: "Enter project description:",
    default: "",
  });
  const git = await input({
    message: "Enter github repository URL:",
    default: "",
  });
  const keywords = await input({
    message: "Enter package keywords: (separate keywords by ,'comma')",
    default: "",
  });
  const author = await input({ message: "Enter author name:", default: "" });
  const license = await input({ message: "Enter License:", default: "ISC" });
  const type = await input({ message: "Enter type:", default: "commonjs" });

  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description,
    keywords: keywords
      .split(",")
      .map((kw) => kw.trim())
      .filter((kw) => kw !== ""),
    homepage: git,
    repository: {
      type: "git",
      url: `${git ? "git+" + git : ""}`,
    },
    license,
    author,
    type,
    main: path.join(sourceDirectory, "server.js"),
    scripts: {
      start: `node ${path.join(sourceDirectory, "server.js")}`,
      dev: `nodemon ${path.join(sourceDirectory, "server.js")}`,
    },
    dependencies: {},
  };

  /**
   * Creaing basic package.json file
   */
  const packageJsonPath = path.join(projectDir, "package.json");
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // install the required dependencies and devDependencies
  /**
   * Installing all the required dependencies
   */
  if (installDependencies) {
    try {
      console.log("Installing required dependencies!\n\n");
      execSync(
        "npm install express dotenv cors body-parser && npm install -D nodemon",
        { cwd: projectDir, stdio: "inherit" }
      );
      console.log(
        "Dependcies installed -> express, dotenv, cors, body-parser, nodemon\n\n"
      );
    } catch (err) {
      console.error("An error occured while installing dependencies =", err);
    }
  }

  console.log("Your server has been set up successfully🎉\n\n");
  console.log("To run server - Run the following commands\n\n");
  console.log(`cd ${projectName}`);
  console.log("npm run dev -> for development");
  console.log("npm start -> for testing");
}

setupExpressVercel();
