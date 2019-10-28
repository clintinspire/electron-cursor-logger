import { ipcRenderer } from "electron";

ipcRenderer.on("cursor-update", (event, log) => {
    updateListUI(log);
});

const updateListUI = (coordinates: { x: number; y: number; }) => {
    const { x, y } = coordinates;
    const listItem = document.createElement("LI");
    const textNode = document.createTextNode(`{ x: ${x}, y: ${y} }`);
    listItem.appendChild(textNode);
    document.getElementById("list").appendChild(listItem);
};
