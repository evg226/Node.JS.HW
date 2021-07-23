const { workerData, parentPort } = require('worker_threads');
const fs = require("fs");
const path = require("path");
let result = 0;
const rs = fs.createReadStream(workerData.fileRead, "utf-8");
const ip = workerData.ip; //тестировали на ip - 34.48.240.111 и 89.123.1.41
const currentDir = workerData.fileRead.split("/").slice(0, -1).join("/");
const ws = ip.map(item => fs.createWriteStream(
    path.join(currentDir, item + "_requests.log"), { flags: "a", encoding: "utf-8" }));

rs.on("error", error => console.log(error));
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
    result = 1;
    console.log("\nWorker: Обработка запроса завершена. Результаты в папке источника");
    parentPort.postMessage({ result });
});

