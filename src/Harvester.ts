import log4js from 'log4js';
import path from 'path';
import fs from 'fs';
import md5 from 'md5';
import { ListIdentifiersWatcher } from "./ListIdentifiersWatcher.js";
import { AbstractRecordResolver } from './RecordResolver/AbstractRecordResolver';
import { EventMaker } from "./EventMaker.js";
import { ComponentsManager } from 'componentsjs';

export class Harvester {
    logger: log4js.Logger;
    databaseFile: string;
    baseUrl: string;
    metadataPrefix: string;
    options: any;
    outDir: string;
    config: string;

    constructor(
        logger: log4js.Logger ,
        databaseFile: string ,
        baseUrl: string ,
        metadataPrefix: string ,
        options: any ,
        outDir: string,
        config?: string , 
    ) {
        this.logger = logger;
        this.databaseFile = databaseFile;
        this.baseUrl = baseUrl;
        this.metadataPrefix = metadataPrefix;
        this.options = options;
        this.outDir = outDir;
        
        if (config) {
            this.config = config;
        }
        else {
            this.config = "./config.jsonld";
        }
    }

    public async harvest() : Promise<void> {
        const manager = await this.makeComponentsManager(this.config, '.');
        let resolver = await manager.instantiate<AbstractRecordResolver>(this.baseUrl);
        let maker    = new EventMaker();
        let watcher  = new ListIdentifiersWatcher(
            this.logger,
            this.databaseFile,
            this.baseUrl,
            this.metadataPrefix,
            this.options
        );

        watcher.on('new', async (rec) => {
            let id       = rec['identifier'];
            let status   = rec['$'].status;
            let res_id   = await resolver.resolve(id);
    
            if (status == 'exists') {
                let metadata = await resolver.metadata(res_id);
                let turtle   = await maker.make_turtle(metadata);
                let md5str   = md5(JSON.stringify(rec));
                let outFile  = `${this.outDir}/${md5str}.ttl`; 
                console.log(`generating ${outFile}`);
                fs.writeFileSync(outFile,turtle);
            }
        });
    
        await watcher.watch();
    }

    private async makeComponentsManager(componentsPath: string, modulePath?: string) : Promise<ComponentsManager<unknown>> {
        let mp = modulePath;
    
        if (mp === undefined) {
            mp = path.join(__dirname, '.');
        }
     
        const manager = await ComponentsManager.build({
            mainModulePath: mp
        });
          
        await manager.configRegistry.register(componentsPath);
    
        return manager;
    }
}