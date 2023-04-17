import { AbstractRecordResolver, type IRecordType } from './AbstractRecordResolver';

require('isomorphic-fetch');

export class HalRecordResolver extends AbstractRecordResolver {

    async resolve(oai_id: string) : Promise<string> {
        this.logger.info(`resolving ${oai_id}`);
        return 'http://hal.science/' + 
                oai_id.replaceAll(/^oai:HAL:/g,'');
    }

    async metadata(url: string) : Promise<IRecordType | null> {
        this.logger.info(`metadata for ${url}`);

        let json_url = url + '/json';
       
        let res = await fetch(json_url);

        let json : any;

        if (res.ok) {
            json = await res.json();
        }
        else {
            this.logger.error(`hal failed with ${res.status} : ${res.statusText}`);
            return null;
        }

        if (! json.response || ! json.response.docs || json.response.docs.length == 0 ) {
            this.logger.error(`no response.docs.[*] in json`);
            return null;
        }

        let hal = json.response.docs[0];

        let record : any = { id: url };

        // if (hal.title_s) {
        //     record.title = hal.title_s;
        // }

        // if (hal.releasedDateY_i) {
        //     record.year = hal.releasedDateY_i;
        // }

        if (hal.doiId_s) {
            record.doi = hal.doiId_s;

            if (record.doi.startsWith('http')) {
                // everything is ok
            }
            else {
                record.doi = 'https://doi.org/' + record.doi;
            }
        }

        if (hal.files_s && hal.files_s.length > 0) {
            let file = hal.files_s[0];

            let mediaType = await this.contentType(file);

            if (!mediaType) {
                mediaType = 'unknown/unknown';
            }

            record.file = {
                id: file ,
                mediaType: mediaType,
                type: [
                  'as:Article',
                  'schema:ScholarlyArticle'
                ] 
            };

            if (hal.openAccess_bool) {
                record.file.access = 'open';
            }
        }

        // if (hal.authORCIDIdExt_s && hal.authORCIDIdExt_s.length > 0) {
        //     let orcIds : string[] = [];

        //     hal.authORCIDIdExt_s.forEach( (author: string) => {
        //         orcIds.push('https://orcid.org/' + author);
        //     });

        //     record.authors = orcIds;
        // }

        return record;
    }
}