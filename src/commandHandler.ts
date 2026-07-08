export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
import { setUser } from './config.js'
import { createUser, getUser} from './lib/db/queries/users.js'

export type CommandsRegistry = {
    [key: string]: CommandHandler;
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    if (registry[cmdName]) {
        await registry[cmdName](cmdName, ...args);
    }
}

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("the login handler expects a single argument, the username");
    }
    const userExists = await getUser(args[0]);
    if (!userExists) {
        throw new Error("given username does not exist");
    }
    setUser(args[0]);
    console.log("the user has been set");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    
    if (args.length === 0) {
        throw new Error("the register handler expects a single argument, the username");
    }

    const existingUser = await getUser(args[0]);
    if (existingUser) {
        throw new Error("user already exists");
    }

    const newUser = await createUser(args[0])

    setUser(args[0]);
    console.log("user was created");
    //For checking results of new user created
    console.log(newUser);
}