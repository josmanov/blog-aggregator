export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
import { setUser } from './config.js'

export type CommandsRegistry = {
    [key: string]: CommandHandler;
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    if (registry[cmdName]) {
        registry[cmdName](cmdName, ...args);
    }
}

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("the login handler expects a single argument, the username");
    }
    setUser(args[0]);
    console.log("the user has been set");
}