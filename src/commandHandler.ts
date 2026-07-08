export type CommandHandler = (cmdName: string, ...args: string[]) => void;
import { setUser } from './config.js'

export type CommandsRegistry = {
    [key: string]: CommandHandler;
}

function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    if (registry[cmdName]) {
        registry[cmdName](cmdName, ...args);
    }
}

function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("the login handler expects a single argument, the username");
    }
    console.log(`Should be the name: ${args[0]}`);
    setUser(args[0]);
    console.log("the user has been set");
}