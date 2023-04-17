import sqlite3 from 'sqlite3';
import log4js from 'log4js';
import { Watcher } from './Watcher.js';

const oai = require('oai-pmh');

export class ListIdentifiersWatcher extends Watcher {
    databaseFile : string;
    baseUrl : string;
    options : any;

    constructor(
            logger: log4js.Logger,
            databaseFile: string, 
            baseUrl: string, 
            metadataPrefix: string, 
            options: any ) {
        super(logger);

        this.databaseFile = databaseFile;
        this.baseUrl = baseUrl;
        
        if (! options) {
            this.options = {};
        }
        else {
            this.options = options;
        }

        this.options['metadataPrefix'] = metadataPrefix;
    }

    async watch() {
        const db = new sqlite3.Database(this.databaseFile);

        const oaiPmh = new oai.OaiPmh(this.baseUrl);
        const identifierIterator = oaiPmh.listIdentifiers(this.options);

        await this.create_table(db);

        for await (const identifier of identifierIterator) {
            const existingRow = await this.exists_record(db,identifier);
   
            if (identifier['$'] && identifier['$']['status']) {
                // We are okay
            }
            else {
                identifier['$'] = { status: 'exists'};
            }

            if (existingRow) {
                if (existingRow.datestamp !== identifier.datestamp) {
                    await this.update_record(db,identifier);
                    this.emit('update',identifier);
                }
                else {
                    this.emit('old',identifier);
                }
            }
            else {
                await this.insert_record(db,identifier);
                this.emit('new',identifier);
            }
        }

        db.close();
    }
}