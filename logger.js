const { ipcRenderer, remote } = require('electron')

onload = function () {
    document.onmousemove = findDocumentCoords;
}

const findDocumentCoords = (mouseEvent) => {
    let xpos
    let ypos;
    let coordinates;
    xpos = mouseEvent.pageX;
    ypos = mouseEvent.pageY;
    coordinates = { xpos, ypos }
    sendLogToMainProcess(coordinates)
    if (!cursorIsNearEdge(coordinates)) {
        updateListUI(coordinates)
    }
}

const cursorIsNearEdge = (coordinates) => {
    let screenWidth = remote.getCurrentWindow().getSize()[0];
    let screenHeight = remote.getCurrentWindow().getSize()[1];
    let isNearSides = (coordinates.xpos < 21 || coordinates.xpos > screenWidth - 40)
    let isNearTopOrBottom = (coordinates.ypos < 21 || coordinates.ypos > screenHeight - 80)
    return (isNearSides || isNearTopOrBottom)
}

const sendLogToMainProcess = (log) => {
    ipcRenderer.send('cursor-position-changed', log)
}

const updateListUI = (log) => {
    document.getElementById('list').innerHTML += (`<li>{ x: ${log.xpos}, y: ${log.ypos} }</li>`);
}
