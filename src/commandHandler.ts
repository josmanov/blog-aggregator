export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
import { setUser } from './config.js'
import { createUser, getUser, deleteUsers, getUsers, getUserById} from './lib/db/queries/users.js'
import { createFeed, getFeeds } from "./lib/db/queries/feeds.js";

import { readConfig } from "./config.js"
import { aggregator } from "./feed.js"

import { feeds, users } from "./lib/db/schema.js"; // adjust path

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export class CommandError extends Error {
    constructor(message: string, public exitCode: 0 | 1 = 1) {
        super(message);
        this.name = "CommandError";
    }
}

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

export async function handlerLogin(_cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("the login handler expects a single argument, the username");
    }
    const userExists = await getUser(args[0]);
    if (!userExists) {
        throw new CommandError("given username does not exist", 1);
    }
    setUser(args[0]);
    console.log("the user has been set");
}

// Why are we using cmdName in the parameter that we arent using? xDD
export async function handlerRegister(_cmdName: string, ...args: string[]) {
    
    if (args.length === 0) {
        throw new CommandError("the register handler expects a single argument, the username");
    }

    const existingUser = await getUser(args[0]);
    if (existingUser) {
        throw new CommandError("user already exists", 1);
    }

    await createUser(args[0])
    setUser(args[0]);
    console.log("user was created");
}

export async function handlerReset(_cmdName: string, ...args: string[]) {
    try {
        await deleteUsers()
        console.log("all users successfully deleted")
    } catch(error) {
        throw new CommandError("couldn't delete all users", 1)
    }
}

export async function handlerUsers(_cmdName: string, ...args: string[]) {
    try {
        const users = await getUsers()
        const config = readConfig();

        for (const user of users) {
            if (user.name == config.currentUserName) {
                console.log(`* ${user.name} (current)`)
            }
            else {
                console.log(`* ${user.name}`)
            }
        }
    } catch(error) {
        throw new CommandError("couldn't get users", 1)
    }
}

export async function handlerAggregator(_cmdName: string, ...args: string[]) {
    try {
        await aggregator()
    } catch(error) {
        throw new CommandError("Couldn't fetch feed data", 1)
    }
}

function printFeed(feed: Feed, user: User) {
  console.log(`ID: ${feed.id}`);
  console.log(`Created: ${feed.createdAt}`);
  console.log(`Updated: ${feed.updatedAt}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

export async function handlerAddfeed(_cmdName: string, ...args: string[]) {
  if (args.length !== 2) {
    throw new CommandError("usage: addfeed <name> <url>", 1);
  }
  const [name, url] = args;
  const config = readConfig();
  const user = await getUser(config.currentUserName);
  if (!user) {
    throw new CommandError("couldn't find current user", 1);
  }
  const feed = await createFeed(name, url, user.id);
  printFeed(feed, user);
}

export async function handlerGetfeeds(_cmdName: string, ...args: string[]) {
    const allFeeds = await getFeeds();
    for (const feed of allFeeds) {
        const user = await getUserById(feed.userId);
        console.log(feed.name);
        console.log(feed.url);
        console.log(user.name);
    }
}