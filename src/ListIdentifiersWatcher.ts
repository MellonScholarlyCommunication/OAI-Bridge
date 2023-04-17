import sqlite3 from 'sqlite3';
import log4js from 'log4js';
import { Watcher } from './Watcher.js';

const oai = require('oai-pmh');

export class ListIdentifiersWatcher extends Watcher {
    databaseFile : string;
    baseUrl : string;
    options : any;
    max = -1;

    constructor(
            logger: log4js.Logger,
            databaseFile: string, 
            baseUrl: string, 
            metadataPrefix: string, 
            options: any ,
            max?: number) {
        super(logger);

        this.databaseFile = databaseFile;
        this.baseUrl = baseUrl;
        this.options = options;
        this.options['metadataPrefix'] = metadataPrefix;

        if (max) {
            this.max = max;
        }
    }

    async watch() {
        const db = new sqlite3.Database(this.databaseFile);

        const oaiPmh = new oai.OaiPmh(this.baseUrl);
        const identifierIterator = oaiPmh.listIdentifiers(this.options);

        await this.create_table(db);

        let record_number = 0;

        for await (const identifier of identifierIterator) {

            if (this.max >= 0 && record_number >= this.max) {
                break;
            }

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
                    record_number++;
                }
                else {
                    this.emit('old',identifier);
                }
            }
            else {
                await this.insert_record(db,identifier);
                this.emit('new',identifier);
                record_number++;
            }

        }

        db.close();
    }
}