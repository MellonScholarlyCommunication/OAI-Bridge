import { AbstractRecordResolver, type IRecordType } from './AbstractRecordResolver';
import { parse } from 'node-html-parser';

require('isomorphic-fetch');

export class RadboudRecordResolver extends AbstractRecordResolver {

    async resolve(oai_id: string) : Promise<string> {
        this.logger.info(`resolving ${oai_id}`);
        return 'https://repository.ubn.ru.nl/handle/' + 
                oai_id.replaceAll(/^oai:repository.ubn.ru.nl:/g,'');
    }

    async metadata(url: string) : Promise<IRecordType | null> {
        this.logger.info(`metadata for ${url}`);

        this.logger.debug(`info ${url}...`);

        const res = await fetch(url);

        let html : string;

        if (res != null && res.ok) {
            html = await res.text();
        }
        else {
            this.logger.debug(`fetch failed`);
            return null;
        }

        let record : any = { id: url };

        const document = parse(html);

        const metas = document.getElementsByTagName('meta');

        for (let i = 0; i < metas.length; i++) {
            const name  = metas[i].getAttribute('name');
            const value = metas[i].getAttribute('content');

            if (name === 'citation_title') {
                record.tite = value;
            }
            else if (name === 'citation_date') {
                record.year = value;
            }
            else if (name === 'citation_pdf_url') {
                record.file = {
                    id: value ,
                    mediatype: 'application/pdf',
                    acces: 'open',
                    type: [
                      'as:Article',
                      'schema:ScholarlyArticle'
                    ] 
                };
            }
            this.logger.debug(`${name} = ${value}`);
        }

        return record;
    }
}