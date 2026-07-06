import  * as fs from 'node:fs';
import { homedir } from "node:os";

export type Config = {

    "dbUrl": string;
    "currentUserName": string;
};

const getConfigFilePath = (): string => {
    
    try {
        const homePath = homedir();
        return (homePath + "/.gatorconfig.json");
    } catch(error) {
        throw new Error("Error: Failed getting home directory path");
    }
}

const validateConfig = (rawConfig: any): Config => {

    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("Missing db_url");
    }
    if (!rawConfig.current_user_name || typeof rawConfig.current_user_name !== "string") {
        throw new Error("Missing current_user_name");
    }

    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name
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

    const result = validateConfig(config)
}