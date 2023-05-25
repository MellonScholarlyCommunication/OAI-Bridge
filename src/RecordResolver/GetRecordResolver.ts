import { AbstractRecordResolver, type IRecordType } from './AbstractRecordResolver';

const oai = require('oai-pmh');

require('isomorphic-fetch');

export class GetRecordResolver extends AbstractRecordResolver {
    baseUrl : string;
    metadataPrefix : string;
    recordUrlPrefix : string;
    fileUrlPrefix : string;

    constructor(baseUrl: string, metadataPrefix: string = 'oai_dc', recordUrlPrefix: string, fileUrlPrefix: string) {
        super();
        this.baseUrl = baseUrl;
        this.metadataPrefix  = metadataPrefix;
        this.recordUrlPrefix = recordUrlPrefix;
        this.fileUrlPrefix   = fileUrlPrefix;
    }

    async resolve(oai_id: string) : Promise<string> {
        this.logger.info(`resolving ${oai_id}`);
        return oai_id;
    }

    async metadata(oai_id: string) : Promise<IRecordType | null> {
        this.logger.info(`metadata for ${oai_id}`);

        const oaiPmh = new oai.OaiPmh(this.baseUrl);

        const data = await oaiPmh.getRecord(oai_id, this.metadataPrefix);

        const datestamp  = data.header.datestamp;

        this.logger.info(`datestamp ${datestamp}`);

        let record : any = { id: oai_id };

        const dc = data.metadata['oai_dc:dc'];

        if (dc) {
           if (dc['dc:title']) {
                record.title = dc['dc:title'];
           } 
           if (dc['dc:date']) {
                record.year = dc['dc:date'];
           }
           if (dc['dc:identifier'] && Array.isArray(dc['dc:identifier'])) {
                
                dc['dc:identifier'].forEach( async (item) => {
                    if (item.startsWith(this.fileUrlPrefix)) {
                        record.file = {
                            id: item ,
                            mediaType: 'unknown/unknown' ,
                            access: 'open',
                            type: [
                                'as:Article',
                                'schema:ScholarlyArticle'
                            ] 
                        }
                    }
                    if (item.startsWith(this.recordUrlPrefix)) {
                        record.id = item;
                    }
                });
           } 
        }

        if (record.file) {
            const mediaType = await this.guessMediaType(record.file.id);

            if (mediaType) {
                record.file.mediaType = mediaType;
            }
            else {
                record.file.mediaType = 'unknown/unknown';
            }
        }
        return record;
    }

    async guessMediaType(url: string) : Promise<string | null> {
        const response = await fetch(url , {
            method: 'HEAD'
        });

        if (! response.ok) {
            return null;
        }

        return response.headers.get('Content-Type');
    }
}