import fetch from 'node-fetch';

export class BiblioRecordResolver {
    constructor(logger) {
        this.logger = logger;
    }

    async resolve(oai_id) {
        this.logger.info(`resolving ${oai_id}`);
        return 'https://biblio.ugent.be/publication/' + 
                oai_id.replaceAll(/^oai:archive.ugent.be:/g,'');
    }

    async metadata(url) {
        this.logger.debug(`metadata for ${url}`);

        let json_url = url + '.json';
       
        let res = await fetch(json_url);

        let json;

        if (res.ok) {
            json = await res.json();
        }
        else {
            return null;
        }

        let record = { id: url };

        if (json.title) {
            record.title = json.title;
        }

        if (json.year) {
            record.year = json.year;
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
            let orcIds = [];
            json.author.forEach( (author) => {
                if (author.orcid_id) {
                    orcIds.push('https://orcid.org/' + author.orcid_id);
                }
            });

            record.authors = orcIds;
        }

        if (json.affiliation && json.affiliation.length > 0) {
            let aff = [];

            json.affiliation.forEach( (affiliation) => {
                if (affiliation.ugent_id) {
                    aff.push( 'https://biblio.ugent.be/organization/' + affiliation.ugent_id);
                }
            });

            record.affiliation = aff;
        }

        return record;
    }
}