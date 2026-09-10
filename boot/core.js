import Database from "../src/js/database.js";


class Core {
    constructor(root="../") {
        this.metadata = {currentDataPath: "bunny-os/boot/data", currentBootData: "bootData.db", currentBootLevel: 1};
        this.path = {
            "root": root,
            "data": this.metadata.currentDataPath,
            "boot": this.metadata.currentBootData
        };

        this.db = new Database(this.path.root, this.metadata.currentBootData, "BooTable");
    }
}
