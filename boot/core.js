import Database from "../src/js/database.js";
import path     from "path";


// Controla a API do sistema no level 1 (API boot init)
class Core {
    constructor(root="../") {
        /*
        dataPath   = path    to    database
        bootLevel  = system  init  level
        dataLevel  = system  data  level
        logLevel   = system  log   level
        */
        this.metadata = {
            current: {
                dataPath:  path.join(root, "boot", "data", "bootData.db"),
                dataLevel: 1,
                bootLevel: 1,
                logLevel:  1,
            }
        };
        this.path = {
            "root": root,
            "data": this.metadata.current.dataPath,
        };
        try {
            this.db = new Database(
                this.path.root,
                this.metadata.current.dataPath,
                "SystemTable"
            );
        } catch (error) {
            console.error("ERROR at LEVEL (1)\n" + error);
            this.db = null;
        }
    }
}
