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
                
                dc['dc:identifier'].forEach( (item) => {
                    if (item.startsWith(this.fileUrlPrefix)) {
                        record.file = {
                            id: item ,
                            mediaType: item.endsWith('.pdf') ? 
                                            'application/pdf' : 'unknown/unknown',
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

        return record;
    }
}