

class Core {
    constructor() {
        this.metadata = {currentBootData: "bootData.db", currentBootLevel: 1};
        this.paths = [
            {"root": "../path"},
            {"bunny-os/boot/data/": this.metadata.currentBootData}
        ];
    }
}
