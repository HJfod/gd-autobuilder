const fs = require("fs");
const pako = require("pako");
const GDShare = require("./gdshare.js");
const pack = require("./package.json");
const objects = require("./objects.json");
const exec = require('child_process').exec;
const readline = require("readline");
const { O_WRONLY } = require("constants");
const o = process.stdout;
const commandPrefix = "--";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

o.write("\n");

rl.on("close", () => process.exit() );

exec('tasklist', (err, stdout, stderr) => {
    if (stdout.toLowerCase().indexOf('geometrydash.exe') > -1) {
        console.log("\x1b[31m", "Please close GD in order to use this program.");
        console.log("\x1b[0m");
        process.exit();
    } else {
        const gpath = GDShare.getCCPath();

        GDShare.decodeCCFile(gpath)
        .then(data => {

            const levelNameList = [];
            const levels = GDShare.getLevels(data, (name, index, max) => {
                o.clearLine();
                o.cursorTo(0);
                o.write(`Found ${index}/${max} levels`);
                levelNameList.push(name);
            });
        
            o.write(`\n\n\x1b[33m ~ The Viprin's Dream ~ v${pack.version}\n\n`);
    
            rl.question(`\x1b[36mType the name of the level you want decorated. \x1b[35m[Type ${commandPrefix}HELP for help]\n\x1b[0m`, name => {
                if (!name.startsWith(commandPrefix)) {
                    GDShare.getLevelInfo(name, levels)
                    .then(info => {
                        const obj = {
                            blocks: [],
                            portals: []
                        };
    
                        pako.inflate(
                            Buffer.from(info.data, 'base64'), { to: "string" }
                        ).toString("utf8").split(";").forEach(o => {
                            let keys = [];
                            let d = o.split(",");
                            for (let i = 0; i < d.length; i += 2) {
                                keys.push({ k: d[i], v: d[i+1]});
                            }
                            keys.forEach(i => {
                                /*
                                if (Number(i.k) === 1) {
                                    if (Number(i.v) === objects.block) {
                                        obj.blocks.push(o);
                                    }
                                }*/
                            });
                            obj.blocks.push(o);
                        });

                        console.log(obj.blocks);
                    })
                    .catch(err => {
                        console.log(`\x1b[31m${err}\x1b[0m\n`);
                        rl.close();
                    });
                } else {
                    switch (name.trim().toLowerCase().substring(commandPrefix.length)) {
                        case "help":
                            o.write(`\n\x1b[32mType ${commandPrefix}LIST to get a list of all your levels.\n\n`);
                            o.write(`Commands are not case-sensitive.\nYou need to reopen the app after a command.`);
                            break;
                        case "list":
                            o.write(`\n\x1b[32m${levelNameList.join("\n")}`);
                            break;
                    }
                    console.log(`\x1b[0m\n`);
                    rl.close();
                }
            });

            // rl.close();
        })
        .catch((err) => {
            console.log("error");
        });
    }
});

/*

const obj = {
    blocks: [],
    portals: []
};

pako.inflate(
	Buffer.from(
		fs.readFileSync("data.txt", "utf8"),
		'base64'
	), { to: "string" }
).toString("utf8").split(";").forEach(o => {
    let keys = [];
    let d = o.split(",");
    for (let i = 0; i < d.length; i += 2) {
        keys.push({ k: d[i], v: d[i+1]});
    }
    keys.forEach(i => {
        if (Number(i.k) === 1) {
            if (Number(i.v) === "") {
                obj.blocks.push(i.v);
            }
        }
    });
});

*/