import { AbstractRecordResolver, type IRecordType } from './AbstractRecordResolver';

require('isomorphic-fetch');

export class BiblioRecordResolver extends AbstractRecordResolver {

    async resolve(oai_id: string) : Promise<string> {
        this.logger.info(`resolving ${oai_id}`);
        return 'https://biblio.ugent.be/publication/' + 
                oai_id.replaceAll(/^oai:archive.ugent.be:/g,'');
    }

    async metadata(url: string) : Promise<IRecordType | null> {
        this.logger.debug(`metadata for ${url}`);

        let json_url = url + '.json';
       
        let res = await fetch(json_url);

        let json : any;

        if (res.ok) {
            json = await res.json();
        }
        else {
            this.logger.error(`biblio failed with ${res.status} : ${res.statusText}`);
            return null;
        }

        let record : any = { id: url };

        if (json.title) {
            record.title = json.title;
        }

        if (json.year) {
            record.year = json.year;
        }

        if (json.classification && json.classification.match(/^(A1|A2|B1|B2|P1|C1|D1)$/)) {
            record.peer_reviewed = true;
        }
        else {
            record.peer_reviewed = false;
        }

        if (json.doi && json.doi.length > 0) {
            record.doi = json.doi[0];

            if (record.doi.startsWith('http')) {
                // everything is ok
            }
            else {
                record.doi = 'https://doi.org/' + record.doi;
            }
        }

        if (json.file && json.file.length > 0) {
            let file = json.file[json.file.length - 1];

            if (file.url) {
                record.file = {
                    id: file.url ,
                    mediaType: file.content_type,
                    access: file.access,
                    type: [
                        'as:Article',
                        'schema:ScholarlyArticle'
                    ] 
                };
            }
        }

        if (json.author && json.author.length > 0) {
            let orcIds : string[] = [];
            json.author.forEach( (author: any) => {
                if (author.orcid_id) {
                    orcIds.push('https://orcid.org/' + author.orcid_id);
                }
            });

            record.authors = orcIds;
        }

        if (json.affiliation && json.affiliation.length > 0) {
            let aff : string[] = [];

            json.affiliation.forEach( (affiliation: any) => {
                if (affiliation.ugent_id) {
                    aff.push( 'https://biblio.ugent.be/organization/' + affiliation.ugent_id);
                }
            });

            record.affiliation = aff;
        }

        return record;
    }
}