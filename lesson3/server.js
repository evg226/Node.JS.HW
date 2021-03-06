// По ссылке вы найдете файл с логами запросов к серверу весом более 2 Гб.
// Напишите программу, которая находит в этом файле все записи с ip-адресами 89.123.1.41 и 34.48.240.111,
// а также сохраняет их в отдельные файлы с названием “%ip-адрес%_requests.log”.

// "https://drive.google.com/file/d/1A8B0eDEagkO6XlpJAinsk8_9qQTsnVly/view";

const fs = require("fs");
const path = require("path");

const fileRead = "access.log";

const rs=fs.createReadStream("./access.log","utf-8");
const ip=["89.123.1.41","34.48.240.111"];
const ws=ip.map(item=>fs.createWriteStream(item+"_requests.log",{flags:"a",encoding:"utf-8"}));

rs.on("error",(error)=>console.log(error));
rs.on("data",chunk=>{
    ws.forEach((wsItem,index)=>{
        let find=chunk.toString().match(new RegExp(ip[index]+'\.*0\"',"g"));
        if (find.length>0) {
            wsItem.write(find.join("\n"));
            wsItem.write("\n");
        }
    });
});
rs.on("end",()=>{
    ws.forEach(item=>item.end());
    clearInterval(message);
    console.log("Обработка файла закончена!" );

});
let i=1;
const message=setInterval(()=>{
    console.log("Выполняется обработка файла"+".".repeat(i++));
    i>20?i=1:i;
    },1000);

