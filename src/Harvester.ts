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
    oai_options: any;
    outDir: string;
    config: string;
    options: any;

    constructor(
        logger: log4js.Logger ,
        databaseFile: string ,
        baseUrl: string ,
        metadataPrefix: string ,
        oai_options: any ,
        outDir: string,
        config: string, 
        options?: any
    ) {
        this.logger = logger;
        this.databaseFile   = databaseFile;
        this.baseUrl        = baseUrl;
        this.metadataPrefix = metadataPrefix;
        this.oai_options    = oai_options;
        this.outDir         = outDir;
        this.config         = config;
        this.options        = options;
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
            this.oai_options,
            this.options.max
        );

        watcher.on('new', async (rec) => { this.processor(maker,resolver,rec) });
        watcher.on('update', async (rec) => { this.processor(maker,resolver,rec) });
    
        await watcher.watch();
    }

    private async processor(maker: EventMaker, resolver: AbstractRecordResolver, rec: any) {
        let id       = rec['identifier'];
        let status   = rec['$'].status;
        let res_id   = await resolver.resolve(id);

        if (status == 'exists') {
            let metadata = await resolver.metadata(res_id);

            if (metadata) {

                if (metadata.file) {
                    if (this.options?.silent) {
                        this.logger.info(`silent processed ${id}`);
                    }
                    else {
                        let turtle   = await maker.make_turtle(metadata);
                        let md5str   = md5(JSON.stringify(rec));
                        let outFile  = `${this.outDir}/${md5str}.ttl`; 
                        this.logger.info(`generating ${outFile}`);
                        fs.writeFileSync(outFile,turtle);
                    }
                }
                else {
                    this.logger.debug(`no file content`);
                }
            }
            else {
                this.logger.debug(`no metadata generated to output`);
            }
        }
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