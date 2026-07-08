import { setUser,  readConfig } from "./config.js"
import { CommandsRegistry, registerCommand, handlerLogin, runCommand } from "./commandHandler.js"

async function main()  {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  const validArgs = process.argv.slice(2);

  if (validArgs.length < 1) {
    console.log("no arguments provided");
    process.exit(1);
  }
  const command = validArgs[0];
  const restCommands = validArgs.slice(1);
  try {
    await runCommand(registry, command, ...restCommands)
  } catch(error) {
    if (error instanceof Error) {
      console.log(error.message);
      process.exit(1);
    }
  }
  process.exit(0)
  /*

  const config = readConfig();
  console.log(config);

  */
}

main();