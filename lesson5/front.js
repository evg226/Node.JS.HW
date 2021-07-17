const listBox = document.querySelector(".fm__catalog");
const fileBox = document.querySelector(".fm__file");
const catalog = document.querySelector(".fm__header");
const file = document.querySelector(".fm__file__header");
window.addEventListener("load", () => loadData("/"));

function createListElements(currentCatalog, list) {
    listBox.innerText = "";
    fileBox.innerText = "";
    catalog.innerText = currentCatalog;
    file.style.display = "none";
    list.forEach(element => {
        const listItem = document.createElement("div");
        listItem.classList.add("fm__item");
        if (!element.isFile) listItem.classList.add("fm__item-catalog");
        listItem.innerText = element.file;
        listItem.addEventListener("click", (event) => {
            const path = catalog.innerHTML +
                (catalog.innerHTML.slice(-1) == "/" ? "" : "/") + event.target.innerHTML;
            file.innerText = path;
            loadData(path);
        })
        listBox.append(listItem);
    });

}

function viewTextFile(text) {
    file.style.display = "inline";
    fileBox.innerText = text;
}

function loadData(currentFile) {
    getData(currentFile)
        .then(data => {
            if (data.hasOwnProperty("list")) {
                createListElements(data.currentCatalog, data.list);
            } else {
                viewTextFile(data);
            }
        })
}

function getData(path) {
    return fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
    }).then(response => {
        if (response.headers.get("Content-Type") == "json") return response.json();
        return response.text();
    }).catch(error => console.log(error))
}
