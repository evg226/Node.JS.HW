// #!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const inquirer = require("inquirer");
const readline = require("readline");

// решение п.1
const options = yargs
    .usage("Usage -p <path>/file -s <string1>,<string2>,..,<stringN> or no parametrs")
    .option("p", { alias: "path", describe: "Path to file", type: "string", demandOption: false })
    .option("s", { alias: "search", describe: "Search string", type: "string", demandOption: false })
    .argv;

if (options.path && options.search) {
    mergeLogFile(options.path, options.search.split(","));
} else {
    readDirectory(__dirname);//п.2
}
// решение п.2
function readDirectory(dir) {
    console.log("Текущая папка: " + dir);
    const isFile = fileName => fs.lstatSync(fileName).isFile();
    const list = fs.readdirSync(dir);
    list.unshift("..");

    inquirer
        .prompt([{
            name: "fileName",
            type: "list",
            message: "Choose file:",
            choices: list
        }])
        .then(answer => {
            console.log("Выбран: " + answer.fileName);
            const filePath = path.join(dir, answer.fileName);
            if (isFile(filePath)) {
                getUserAnswer()
                    .then(result => mergeLogFile(filePath, result.split(",")));
            } else {
                if (answer.fileName == "..") {
                    dir = dir.split("/");
                    dir.pop();
                    dir = dir.join("/");
                } else {
                    dir += "/" + answer.fileName;
                }
                readDirectory(dir);
            }
        })
}

// Решение п.3
function getUserAnswer() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, rejects) => {
        rl.question("Введите IP-адрес(a) или др. строку(и) поиска через запятую: ", searchStr => {
            resolve(searchStr);
            rl.close();
        })
    });
}

//из урока 3 измененный
function mergeLogFile(fileRead, ip) {
    const rs = fs.createReadStream(fileRead, "utf-8");
    // const ip = ["89.123.1.41", "34.48.240.111"];
    // const ws = ip.map(item => fs.createWriteStream(item + "_requests.log", { flags: "a", encoding: "utf-8" }));
    const currentDir = fileRead.split("/").slice(0, -1).join("/");
    const ws = ip.map(item => fs.createWriteStream(
        path.join(currentDir, item + "_requests.log"), { flags: "a", encoding: "utf-8" }));

    rs.on("error", (error) => {
        clearInterval(message);
        console.log(error);
    });
    rs.on("data", chunk => {
        ws.forEach((wsItem, index) => {
            let find = chunk.toString().match(new RegExp(ip[index] + '\.*0\"', "g"));
            if (find) {
                wsItem.write(find.join("\n"));
                wsItem.write("\n");
            }
        });
    });
    rs.on("end", () => {
        ws.forEach(item => item.end());
        clearInterval(message);
        console.log("Обработка файла закончена!");

    });
    let i = 1;
    console.log(fileRead);
    const message = setInterval(() => {
        console.log("Выполняется обработка файла" + ".".repeat(i++));
        i > 20 ? i = 1 : i;
    }, 1000);

}

