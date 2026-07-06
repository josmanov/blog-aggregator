import  * as fs from 'node:fs';
import { homedir } from "node:os";

export type Config = {
    dbUrl: string;
};

const getConfigFilePath = (): string => {
    
    try {
        const homePath = homedir();
        return (homePath + "/.gatorconfig.json");
    } catch(error) {
        throw new Error("Error: Failed getting home directory path");
    }

}

export const setUser = () => {
    const configPath = getConfigFilePath();
    console.log(configPath);
    const data = fs.readFileSync(configPath, "utf-8");
    
    console.log(data);
}