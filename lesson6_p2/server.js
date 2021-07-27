// #!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const inquirer = require("inquirer");
const readline = require("readline");

const { Worker } = require("worker_threads");

const options = yargs
    .usage("Usage -p <path>/file -s <string1>,<string2>,..,<stringN> or no parametrs")
    .option("p", { alias: "path", describe: "Path to file", type: "string", demandOption: false })
    .option("s", { alias: "search", describe: "Search string", type: "string", demandOption: false })
    .argv;

const interval = {//в основном процессе (пока работает worker) работает setInterval. Здесь могла быть и другая фукнция.
    i: 1,
    message: 0,
    start: function () {
        this.message = setInterval(() => {
            if ((this.i++) == 1) process.stdout.write(`Основной процесс: Я свободен\n
                    Основной процесс:Здесь могла быть обработка других задач`);
            process.stdout.write(".");
        }, 1000);
    },
    stop: function () {
        clearInterval(this.message);
    }
}

if (options.path && options.search) {
    startWorker(options.path, options.search.split(","))
        .then(data => resultWorker(data));
} else {
    readDirectory(__dirname);//п.2
}

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
                    .then(result => startWorker(filePath, result.split(",")).then(data => resultWorker(data)));
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

function startWorker(fileRead, ip) {
    return new Promise((resolve, reject) => {
        console.log("Основной процесс: передаю задачу Worker'у");
        const workerData = { fileRead, ip };
        const worker = new Worker("./worker.js", { workerData });
        worker.on("message", resolve);
        worker.on("error", reject);
        interval.start();
    })
}


function resultWorker(data) {
    if (data.result == 1) {
        console.log("Основной процесс: Работа Worker'a принята");
    } else if (data.result == 0) {
        console.log("Основной процесс: Работа Worker'a прервана");
    } else {
        console.log("Внештатная ситуация");
    }
    interval.stop();
}



