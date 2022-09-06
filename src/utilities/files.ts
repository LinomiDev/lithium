import * as fs from "fs";
import path from "path";

export function mkdirs(dirPath: string) {
    dirPath = path.resolve(path.normalize(dirPath));

    if (fs.existsSync(dirPath)) {
        if (fs.statSync(dirPath).isDirectory()) {
            // console.log(`${dirPath} is already exists.`);
            return;
        }
    }

    let i = dirPath.lastIndexOf(path.sep);
    if (i < 0) {
        console.log(`${dirPath} has no parent dir.`);
        return;
    }

    mkdirs(dirPath.substring(0, i));
    fs.mkdirSync(dirPath);
}
