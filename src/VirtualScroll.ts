import { ipcRenderer } from "electron";

const DUMMY = [
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
    private lastRepaintY: number;
    scroller: HTMLDivElement;
    width: any;
    height: any;
    first: number;

    constructor(config: IConfig) {
        this.width = (config && config.w + "px") || "100%";
        this.height = (config && config.h + "px") || "100%";
        this.scroller = this.createScroller(this.itemHeight * this.totalRows);

        this.itemHeight = config.itemHeight;
        this.onScroll = this.onScroll.bind(this);
        this.items = DUMMY;
        this.totalRows = this.items.length; // TODO remove
        this.container = this.createContainer(this.width, this.height);
        this.container.appendChild(this.scroller);
        this.screenItemsLen = Math.ceil(config.h / this.itemHeight);
        this.cachedItemsLen = this.screenItemsLen * 3;
        this.maxBuffer = this.screenItemsLen * this.itemHeight;
        this.lastScrolled = 0;
        this.lastRepaintY = 0;
        this.renderChunk(this.container, 0);
        this.awaitLogs();
        this.removeBadNodes();
        this.first = 0;

        this.container.addEventListener("scroll", this.onScroll);
    }

    private awaitLogs() {
        ipcRenderer.on("cursor-update", (event, log) => {
            this.items.push(log)
        });
    }

    private removeBadNodes() {
        setInterval(function () {
            if (Date.now() - this.lastScrolled > 100) {
                const badNodes = document.querySelectorAll('[data-rm="1"]');
                for (let i = 0, l = badNodes.length; i < l; i++) {
                    this.container.removeChild(badNodes[i]);
                }
            }
        }, 300);
    }

    private createRow(i: number) {
        let item: HTMLElement;
        const index = Math.floor(i);
        const text = (!!this.items[index] && `${this.items[index].x}, ${this.items[index].y}`) || "no text";
        const itemText = document.createTextNode(text);
        item = document.createElement("div");
        item.style.height = this.itemHeight + "px";
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

    private createContainer(w: string, h: string) {
        const c = document.createElement("div");
        c.style.width = w;
        c.style.height = h;
        c.style.overflow = "auto";
        c.style.position = "relative";
        c.style.padding = "0";
        return c;
    }

    private createScroller(h: number) {
        const scroller = document.createElement("div");
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
        if (!this.lastRepaintY || Math.abs(scrollTop - this.lastRepaintY) > this.maxBuffer) {
            this.first = (scrollTop / this.itemHeight) - this.screenItemsLen;
            this.renderChunk(this.container, this.first < 0 ? 0 : this.first);
            this.lastRepaintY = scrollTop;
        }

        // console.log(parseInt(this.height) - scrollTop)
        console.log(e.target)
        // console.log(scrollTop)
        // if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        //     console.log("you're at the bottom of the page")
        // }
        this.lastScrolled = Date.now();

        e.preventDefault();
    }


}

const list = new VirtualList({
    h: 300,
    itemHeight: 24,
    w: 300,
});

type IConfig = {
    h: number;
    itemHeight: number;
    w: number;
}

type IList = {
    x: number;
    y: number;
}

document.getElementById("container").appendChild(list.container);
