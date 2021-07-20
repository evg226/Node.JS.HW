const http = require("http");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const PORT = 3000;

http.createServer((request, response) => {
    if (request.method === "GET") {
        if (request.url == "/") {
            const file = path.join(__dirname, "index.html");
            const rs = fs.createReadStream(file);
            response.writeHead(200, { "Content-Type": "text/html" });
            rs.pipe(response);
        } else if (request.url.includes("css") || request.url.includes("js")) {
            const file = path.join(__dirname, request.url);
            const rs = fs.createReadStream(file);
            response.writeHead(200, { "Content-Type": request.url.includes("css") ? "text/css" : "text/js" });
            rs.pipe(response);
        }
    } else if (request.method === "POST") {
        const item = __dirname + request.url;
        if (!isFile(item)) {
            const listDir = readDirectory(item);
            // console.log(item);
            const answer = { currentCatalog: request.url, list: listDir }
            response.writeHead(200, { "Content-Type": "json" })
            response.end(JSON.stringify(answer));
        } else {
            const rs = fs.createReadStream(item);
            response.writeHead(200, { "Content-Type": "text/html" });
            rs.pipe(response);
        }
    } else {
        response.statusCode = 405;
        response.end();
    }
}).listen(3000, "localhost", () => {
    console.log("Сервер запущен");
});

function isFile(fileName) {
    return fs.lstatSync(fileName).isFile();
}
function readDirectory(dir) {
    const list = fs.readdirSync(dir);
    const listObj = list.map(item => {
        return { file: item, isFile: isFile(path.join(dir, item)) }
    });
    if (dir !== __dirname + "/") listObj.unshift({ file: "..", isFile: false });
    return listObj;
}

