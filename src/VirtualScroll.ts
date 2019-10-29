import { ipcRenderer } from "electron";
import { IConfig, IList } from "./Interfaces";
const CONTAINER_WIDTH = "300px";
const CACHED_MULTIPLIER = 3; // 3x the items in case user scrolls fast

class VirtualList {
    public container: Element;
    private totalRows: number;
    private cachedItemsLen: number;
    private itemHeight: number;
    private items: IList[];
    private screenItemsLen: number;
    private lastScrolled: number;
    private maxBuffer: number;
    private previousY: number;
    private scroller: HTMLDivElement;
    private height: number;
    private first: number;

    constructor(config: IConfig) {
        this.height = config.h;
        this.itemHeight = config.itemHeight;

        this.removeHiddenNodes = this.removeHiddenNodes.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.items = []; // the main data container
        this.totalRows = this.items.length;

        this.scroller = this.createScroller(this.itemHeight * this.totalRows);
        this.container = this.createContainer(this.height);
        this.container.appendChild(this.scroller);

        this.screenItemsLen = Math.ceil(config.h / this.itemHeight); // get length on items currently displayed
        this.cachedItemsLen = this.screenItemsLen * CACHED_MULTIPLIER;
        this.maxBuffer = this.screenItemsLen * this.itemHeight; // create buffer so list wont break
        this.lastScrolled = 0; // used as determinant of which nodes to remove.
        this.previousY = 0; // keep track of previous position.
        this.first = 0; // start ypos of scroll. more like "curentY"

        this.renderChunk(this.container, 0); // TODO fix first batch of scroll
        this.awaitLogs(); // asynchronously load loahs and fill the array.
        this.removeHiddenNodes(); // asynchronously remove nodes not displayed.

        this.container.addEventListener("scroll", this.onScroll);
    }

    private awaitLogs() {
        ipcRenderer.on("cursor-update", (event, log) => {
            this.items.push(log);
            this.totalRows = this.items.length;
            this.repaintScroller();
        });
    }

    private removeHiddenNodes() {
        const self = this;
        setInterval(() => {
            if (Date.now() - self.lastScrolled > 100) {
                const hiddenNodes = document.querySelectorAll('[data-rm="1"]');
                for (let i = 0, l = hiddenNodes.length; i < l; i++) {
                    self.container.removeChild(hiddenNodes[i]);
                }
            }
        }, 300);
    }

    private createRow(i: number) {
        let item: HTMLElement;
        const index = Math.floor(i);
        const text = (!!this.items[index] && `${index}  { x: ${this.items[index].x}, y: ${this.items[index].y} }`) || "no text";
        const itemText = document.createTextNode(text);
        item = document.createElement("div");
        item.style.height = this.itemHeight + "px";
        item.style.position = "absolute";
        item.appendChild(itemText);
        item.style.top = (i * this.itemHeight) + "px";
        return item;
    }

    private renderChunk(node, from) {
        let finalItem = from + this.cachedItemsLen;
        if (finalItem > this.totalRows) {
            finalItem = this.totalRows;
        }

        const fragment = document.createDocumentFragment();
        for (let i = from; i < finalItem; i++) {
            fragment.appendChild(this.createRow(i));
        }

        for (let j = 1, l = node.childNodes.length; j < l; j++) {
            node.childNodes[j].style.display = "none";
            node.childNodes[j].setAttribute("data-rm", "1");
        }
        node.appendChild(fragment);
    }

    private createContainer(h: number) {
        const c = document.createElement("div");
        c.style.width = CONTAINER_WIDTH;
        c.style.height = h + "px";
        c.style.overflow = "auto";
        c.style.position = "relative";
        c.style.padding = "0";
        return c;
    }

    private createScroller(h: number) {
        const scroller = document.createElement("div");
        scroller.id = "scroller";
        scroller.style.opacity = "0";
        scroller.style.position = "absolute";
        scroller.style.top = "0";
        scroller.style.left = "0";
        scroller.style.width = "1px";
        scroller.style.height = h + "px";
        return scroller;
    }

    private onScroll(e: Event) {
        const scrollTop = e.target.scrollTop;
        if ((!this.previousY || Math.abs(scrollTop - this.previousY) > this.maxBuffer)) {
            this.first = (scrollTop / this.itemHeight);
            this.renderChunk(this.container, this.first < 0 ? 0 : this.first);
            this.previousY = scrollTop;
        }

        this.lastScrolled = Date.now();
        e.preventDefault();
    }

    private repaintScroller() {
        const scroller = document.getElementById("scroller");
        const newScroller = this.createScroller(this.itemHeight * this.totalRows);
        scroller.parentNode.replaceChild(newScroller, scroller);
    }
}

const list = new VirtualList({
    h: 320,
    itemHeight: 20,
});

document.getElementById("container").appendChild(list.container);
