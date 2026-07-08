import  * as fs from 'node:fs';
import { homedir } from "node:os";

export type Config = {

    "dbUrl": string;
    "currentUserName": string;
};

const getConfigFilePath = (): string => {
    
    const homePath = homedir();
    return (homePath + "/.gatorconfig.json");
}

const validateConfig = (rawConfig: unknown): Config => {

    if (typeof rawConfig !== "object" || rawConfig === null) {
    throw new Error("Invalid config");
    }
    const obj = rawConfig as {
        db_url: unknown;
        current_user_name: unknown;
    }
    if (typeof obj.db_url !== "string") {
        throw new Error("Missing db_url");
    }
    if (typeof obj.current_user_name !== "string") {
        throw new Error("Missing current_user_name");
    }

    return {
        dbUrl: obj.db_url,
        currentUserName: obj.current_user_name
    }
}

export const readConfig = (): Config => {

    const configPath = getConfigFilePath();
    const configData = fs.readFileSync(configPath, "utf-8");
    const configObj = JSON.parse(configData);
    const validatedConfig = validateConfig(configObj);
    return (validatedConfig);
}

export const setUser = (name: string) => {

    const configObj = readConfig();
    const configModified: Config = {
        "dbUrl": configObj.dbUrl,
        "currentUserName": name
    }
    writeConfig(configModified)
}

const writeConfig = (config: Config): void => {

    const path = getConfigFilePath();
    const fileConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName
    }
    const data = JSON.stringify(fileConfig, null, 2);
    fs.writeFileSync(path, data, "utf-8")
}