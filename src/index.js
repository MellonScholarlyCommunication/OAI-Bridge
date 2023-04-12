import log4js from 'log4js';
import md5 from 'md5';
import fs from 'fs';
import { ListIdentifiersWatcher } from "./ListIdentifiersWatcher.js";
import { BiblioRecordResolver } from "./RecordResolver/BiblioRecordResolver.js";
import { EventMaker } from "./EventMaker.js";

const DEBUG_LEVEL = "warn"; 
const DB_FILE     = './biblio.db';
const BASE_URL    = 'https://biblio.ugent.be/oai';
const OUT_DIR     = './in';
const DAY_OFFSET  = -2;

async function main (databaseFile, baseUrl,metadataPrefix,options) {
    let logger   = log4js.getLogger();
    logger.level = DEBUG_LEVEL;

    let maker    = new EventMaker();
    let resolver = new BiblioRecordResolver(logger);
    let watcher  = new ListIdentifiersWatcher(
        logger,
        databaseFile,
        baseUrl,
        metadataPrefix,
        options
    );

    watcher.on('new', async (rec) => {
        let id       = rec['identifier'];
        let status   = rec['$'].status;
        let res_id   = await resolver.resolve(id);

        if (status == 'exists') {
            let metadata = await resolver.metadata(res_id);
            let turtle   = await maker.make_turtle(metadata);
            let md5str   = md5(JSON.stringify(rec));
            let outFile  = `${OUT_DIR}/${md5str}.ttl`; 
            console.log(`generating ${outFile}`);
            fs.writeFileSync(outFile,turtle);
        }
    });

    await watcher.watch();
}

let d = new Date();
d.setDate(d.getDate() + DAY_OFFSET);
let from = d.toISOString().replaceAll(/\.\d+Z$/g,'Z');

main(DB_FILE,BASE_URL, 'oai_dc', {
    from: from
}).catch(console.error);