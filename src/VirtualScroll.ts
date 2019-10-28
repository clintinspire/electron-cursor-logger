import { ipcRenderer } from "electron";

const DUMMY = [
    { id: 1, text: "hello" },
    { id: 2, text: "there" },
    { id: 3, text: "general" },
    { id: 4, text: "kinobi" },
];

class VirtualList {
    public container: Element;
    private totalRows: number;
    private cachedItemsLen: number;
    private itemHeight: number;
    private items: object[];
    private screenItemsLen: number;
    private lastScrolled: number;
    private maxBuffer: number;
    private lastRepaintY: number;
    private rmNodeInterval: NodeJS.Timeout;

    constructor(config: IConfig) {
        const width = (config && config.w + "px") || "100%";
        const height = (config && config.h + "px") || "100%";
        const itemHeight = config.itemHeight;
        const scroller = this.createScroller(itemHeight * this.totalRows);

        this.onScroll = this.onScroll.bind(this);
        this.items = DUMMY;
        this.totalRows = config.totalRows; // TODO remove
        this.container = this.createContainer(width, height);
        this.container.appendChild(scroller);
        this.screenItemsLen = Math.ceil(config.h / itemHeight);
        this.cachedItemsLen = this.screenItemsLen * 3;
        this.renderChunk(this.container, 0);
        // let lastRepaintY;
        this.maxBuffer = this.screenItemsLen * itemHeight;
        this.lastScrolled = 0;

        this.rmNodeInterval = setInterval(function() {
            if (Date.now() - this.lastScrolled > 100) {
                const badNodes = document.querySelectorAll('[data-rm="1"]');
                for (let i = 0, l = badNodes.length; i < l; i++) {
                    this.container.removeChild(badNodes[i]);
                }
            }
        }, 300);

        // ipcRenderer.on("cursor-update", (event, log) => {
        //     this.items.push(log)
        // });
        // this.container.addEventListener("scroll", this.onScroll);
    }

    private createRow(i: number) {
        let item: HTMLDivElement;
        const itemText = document.createTextNode((!!this.items[i] && this.items[i].text) || "no text");
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
            const first = (scrollTop / this.itemHeight) - this.screenItemsLen;
            this.renderChunk(this.container, first < 0 ? 0 : first);
            this.lastRepaintY = scrollTop;
        }

        this.lastScrolled = Date.now();
        e.preventDefault();
    }
}

const list = new VirtualList({
    h: 300,
    itemHeight: 24,
    totalRows: 1000,
    w: 300,
});

interface IConfig {
    h: number;
    itemHeight: number;
    totalRows: number;
    w: number;
}

document.getElementById("container").appendChild(list.container);
