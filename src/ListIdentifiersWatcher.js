import { Watcher } from './Watcher.js';
import oai from 'oai-pmh';
import sqlite3 from 'sqlite3';

export class ListIdentifiersWatcher extends Watcher {
    constructor(logger,databaseFile, baseUrl, metadataPrefix, options) {
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
            const id = identifier['identifier'];
   
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