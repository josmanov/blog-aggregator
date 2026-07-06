import  * as fs from 'node:fs';

export type Config = {
    dbUrl: string;
};

export let setUser = (path: string) => {
    const data = fs.readFileSync(path, "utf-8")
}