#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { input, confirm, select } =   require("@inquirer/prompts");
const { execSync } = require("child_process");

async function setupExpressVercel() {
  const projectName = await input({ message: "Enter project name.", default: "express-app" });
  const sourceDirectory = ".";
  const installDependencies = await confirm({ message: "Packages to be installed - express, dotenv, body-parser, cors, nodemon", default: true });

  const projectDir = path.join(process.cwd(), projectName);
  const sourceDir = projectDir;

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
    console.log("Created project directory!\n");
  }

  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDirectory, { recursive: true });
    console.log("Created source directory!\n");
  }

  // copy contents of template/server.js
  const serverTemplate = path.join(__dirname, "../template/server.js");
  const serverFile = path.join(sourceDir, "server.js");
  try {
    fs.copyFileSync(serverTemplate, serverFile);
    console.log("\nCreated server.js in source directory!\n");
  } catch (error) {
    console.error("Error copying server.js template:", error);
  }

  // .env file
  const dotEnvContent= `#Add any enviornment variables as needed\n\nPORT="3000"\nFRONTEND_DOMAIN=""`
  const envPath = path.join(projectDir, ".env");
  fs.writeFileSync(envPath, dotEnvContent);

  // vercel.json file
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
        dest: `${path.join(sourceDirectory, "server.js")}`
      },
    ],
  };
  const vercelJsonFile = path.join(projectDir, "vercel.json");
  fs.writeFileSync(vercelJsonFile, JSON.stringify(vercelJsonContent, null, 2));

  try {
    execSync("git init", { cwd: projectDir, stdio: "inherit" });
  } catch(err) {
    console.error("An error occured while initialing git:", err);
  }

  // .gitignore
  const gitIgnoreContent = `#Add anything that needs to be ignored here.\nnode_modules/\n.env`;
  const gitIgnoreFile = path.join(projectDir, ".gitignore");
  fs.writeFileSync(gitIgnoreFile, gitIgnoreContent);

  const packageJson = {
    name: projectName,
    version: "1.0.0",
    main: path.join(sourceDirectory, "server.js"),
    scripts: {
      start: `node ${path.join(sourceDirectory, "server.js")}`,
      dev: `nodemon ${path.join(sourceDirectory, "server.js")}`,
    },
    dependencies: {},
  };

  const packageJsonPath = path.join(projectDir, "package.json");
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Created package.json in ${projectDir}`);

  // install the required dependencies and devDependencies
  if(installDependencies) {
    try {
      console.log("Installing required dependencies!\n\n");
      execSync(
        "npm install express dotenv cors body-parser && npm install -D nodemon",
        { cwd: projectDir, stdio: "inherit" }
      );
      console.log("Dependcies installed -> express, dotenv, cors, body-parser, nodemon\n\n");
    } catch(err) {
      console.error("An error occured while installing dependencies =", err);
    }
  }

  console.log("Your server has been set up successfully🎉\n\n")
  console.log("To run server - Run the following commands\n\n")
  console.log(`cd ${projectName}`);
  console.log("npm run dev -> for development");
  console.log("npm start -> for testing");
}

setupExpressVercel();