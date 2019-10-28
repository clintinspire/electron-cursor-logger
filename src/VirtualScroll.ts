import { ipcRenderer } from "electron";
const CONTAINER_WIDTH = "300px";
const CACHED_ITEMS_MULTIPLIER = 4; // 4x the items in case user scrolls fast
const DUMMY = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 7, y: 1 },
    { x: 8, y: 1 },
    { x: 9, y: 1 },
    { x: 10, y: 1 },
    { x: 11, y: 1 },
    { x: 12, y: 1 },
    { x: 13, y: 1 },
    { x: 14, y: 1 },
    { x: 15, y: 1 },
    { x: 16, y: 1 },
    { x: 17, y: 1 },
    { x: 18, y: 1 },
    { x: 19, y: 1 },
    { x: 20, y: 1 },
    { x: 21, y: 1 },
    { x: 22, y: 1 },
    { x: 23, y: 1 },
    { x: 24, y: 1 },
    { x: 25, y: 1 },
    { x: 26, y: 1 },
    { x: 27, y: 1 },
    { x: 28, y: 1 },
    { x: 29, y: 1 },
    { x: 30, y: 1 },
    { x: 31, y: 1 },
    { x: 32, y: 1 },
    { x: 33, y: 1 },
    { x: 34, y: 1 },
    { x: 35, y: 1 },
    { x: 36, y: 1 },
    { x: 37, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 3 },
    { x: 6, y: 3 },
    { x: 7, y: 3 },
    { x: 8, y: 3 },
    { x: 9, y: 3 },
    { x: 10, y: 3 },
    { x: 11, y: 3 },
    { x: 12, y: 3 },
    { x: 13, y: 3 },
    { x: 14, y: 3 },
    { x: 15, y: 3 },
    { x: 16, y: 3 },
    { x: 17, y: 3 },
    { x: 18, y: 3 },
    { x: 19, y: 3 },
    { x: 20, y: 3 },
    { x: 21, y: 3 },
    { x: 22, y: 3 },
    { x: 23, y: 3 },
    { x: 24, y: 3 },
    { x: 25, y: 3 },
    { x: 26, y: 3 },
    { x: 27, y: 3 },
    { x: 28, y: 3 },
    { x: 29, y: 3 },
    { x: 30, y: 3 },
    { x: 31, y: 3 },
    { x: 32, y: 3 },
    { x: 33, y: 3 },
    { x: 34, y: 3 },
    { x: 35, y: 3 },
    { x: 36, y: 3 },
    { x: 37, y: 3 },
];

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
    private height: any;
    private first: number;

    constructor(config: IConfig) {
        this.height = (config && config.h + "px") || "100%";

        this.itemHeight = config.itemHeight;
        this.removeHiddenNodes = this.removeHiddenNodes.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.items = [];
        this.totalRows = this.items.length;

        this.scroller = this.createScroller(this.itemHeight * this.totalRows);
        this.container = this.createContainer(this.height);
        this.container.appendChild(this.scroller);

        this.screenItemsLen = Math.ceil(config.h / this.itemHeight);
        this.cachedItemsLen = this.screenItemsLen * CACHED_ITEMS_MULTIPLIER;
        this.maxBuffer = this.screenItemsLen * this.itemHeight;
        
        this.lastScrolled = 0;
        this.previousY = 0;
        this.first = 0;

        this.renderChunk(this.container, 0);
        this.awaitLogs();
        this.removeHiddenNodes();

        this.container.addEventListener("scroll", this.onScroll);
    }

    private awaitLogs() {
        ipcRenderer.on("cursor-update", (event, log) => {
            this.items.push(log)
            this.totalRows = this.items.length
            this.repaintScroller();
        });
    }

    private removeHiddenNodes() {
        const self = this
        setInterval(function () {
            if (Date.now() - self.lastScrolled > 100) {
                const hiddenNodes = document.querySelectorAll('[data-rm="1"]');
                for (let i = 0, l = hiddenNodes.length; i < l; i++) {
                    self.container.removeChild(hiddenNodes[i]);
                }
                // const pad = self.createPadding(hiddenNodes.length)
                // self.container.style.padding = (this.itemHeight * hiddenNodes.length) + "px"
            }
        }, 300);
    }

    private createRow(i: number) {
        let item: HTMLElement;
        const index = Math.floor(i);
        const text = (!!this.items[index] && `${index}  [${this.items[index].x}, ${this.items[index].y}]`) || "no text";
        const itemText = document.createTextNode(text);
        item = document.createElement("div");
        item.style.height = this.itemHeight + "px";
        item.style.position = "absolute"
        item.appendChild(itemText);
        item.style.top = (i * this.itemHeight) + "px";
        return item;
    }

    private createPadding(count: number) {
        let item: HTMLElement;
        item = document.createElement("div");
        item.style.height = (this.itemHeight * count) + "px";
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

    private createContainer(h: string) {
        const c = document.createElement("div");
        c.style.width = CONTAINER_WIDTH;
        c.style.height = h;
        c.style.overflow = "auto";
        c.style.position = "relative";
        c.style.padding = "0";
        return c;
    }

    private createScroller(h: number) {
        const scroller = document.createElement("div");
        scroller.id = "scroller"
        scroller.style.opacity = "0";
        scroller.style.position = "absolute";
        scroller.style.top = "0";
        scroller.style.left = "0";
        scroller.style.width = "1px";
        scroller.style.height = h + "px";
        return scroller;
    }

    private onScroll(e: Event) {
        const te = e.target;
        const scrollTop = te.scrollTop; // Triggers reflow
        
        if ((!this.previousY || Math.abs(scrollTop - this.previousY) > this.maxBuffer)) {
            this.first = (scrollTop / this.itemHeight);

            console.log("y/h", scrollTop / this.itemHeight);
            console.log("first", this.first)

            this.renderChunk(this.container, this.first < 0 ? 0 : this.first);
            this.previousY = scrollTop;
        }


        this.lastScrolled = Date.now();
        e.preventDefault();
    }

    private repaintScroller() {
        const scroller = document.getElementById("scroller");
        const newScroller = this.createScroller(this.itemHeight * this.totalRows)
        scroller.parentNode.replaceChild(newScroller, scroller);
    }


}

const list = new VirtualList({
    h: 300,
    itemHeight: 20,
});

type IConfig = {
    h: number;
    itemHeight: number;
}

type IList = {
    x: number;
    y: number;
}

document.getElementById("container").appendChild(list.container);
