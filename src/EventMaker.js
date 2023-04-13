import n3, { BlankNode } from 'n3';

const { DataFactory } = n3;
const { namedNode, literal, createBlankNode, quad} = DataFactory;

const AS_TYPE     = 'https://www.w3.org/ns/activitystreams#';
const LDP_TYPE    = 'http://www.w3.org/ns/ldp#';
const XSD_TYPE    = 'http://www.w3.org/2001/XMLSchema#';
const EVENT_TYPE  = 'http://example.org/event#';
const VCARD_TYPE  = 'http://www.w3.org/2006/vcard/ns#';
const SCHEMA_TYPE = 'https://schema.org/';
const IETF_TYPE   = 'http://www.iana.org/assignments/relation/';
const RDF_TYPE    = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const DCT_TYPE    = 'http://purl.org/dc/terms/';

export class EventMaker {

    prefix_expand(str) {
        if (str.startsWith('rdf:')) {
            return str.replace('rdf:',RDF_TYPE);
        }
        if (str.startsWith('as:')) {
            return str.replace('as:',AS_TYPE);
        }
        if (str.startsWith('ldp:')) {
            return str.replace('ldp:',LDP_TYPE);
        }
        if (str.startsWith('xsd:')) {
            return str.replace('xsd:',LDP_TYPE);
        }
        if (str.startsWith('evt:')) {
            return str.replace('evt:',EVENT_TYPE);
        }
        if (str.startsWith('vcard:')) {
            return str.replace('vcard:',VCARD_TYPE);
        }
        if (str.startsWith('schema:')) {
            return str.replace('schema:',SCHEMA_TYPE);
        }
        if (str.startsWith('ietf:')) {
            return str.replace('ietf:',IETF_TYPE);
        }
        if (str.startsWith('dct:')) {
            return str.replace('dct:',DCT_TYPE);
        }
        return str;
    }

    async make_turtle(info) {
        const writer = new n3.Writer({ 
            prefixes: { 
                as: AS_TYPE ,
                ietf: IETF_TYPE,
                sorg: SCHEMA_TYPE
            } 
        });
        return new Promise( (resolve,reject) =>  {
            writer.addQuad(
                quad(
                    namedNode(info.id),
                    namedNode(this.prefix_expand('rdf:type')),
                    namedNode(this.prefix_expand('schema:AboutPage'))
                )
            );

            if (info.title) {
                writer.addQuad(
                    quad(
                        namedNode(info.id),
                        namedNode(this.prefix_expand('schema:name')),
                        literal(info.title)
                    )
                );
            }

            if (info.year) {
                writer.addQuad(
                    quad(
                        namedNode(info.id),
                        namedNode(this.prefix_expand('schema:datePublished')),
                        literal(info.year)
                    )
                );
            }

            if (info.doi) {
                writer.addQuad(
                    quad(
                        namedNode(info.id),
                        namedNode(this.prefix_expand('ietf:cite-as')),
                        namedNode(info.doi)
                    )
                );
            }

            if (info.file) {
                writer.addQuad(
                    quad(
                        namedNode(info.id),
                        namedNode(this.prefix_expand('as:url')),
                        namedNode(info.file.id)
                    ) 
                );

                writer.addQuad(
                    quad(
                        namedNode(info.file.id),
                        namedNode(this.prefix_expand('as:mediaType')),
                        literal(info.file.mediaType)
                    ) 
                );

                writer.addQuad(
                    quad(
                        namedNode(info.file.id),
                        namedNode(this.prefix_expand('dct:accessRights')),
                        literal(info.file.access)
                    ) 
                );

                info.file.type.forEach( (type) => {
                    writer.addQuad(
                        quad(
                            namedNode(info.file.id),
                            namedNode(this.prefix_expand('rdf:type')),
                            namedNode(this.prefix_expand(type))
                        ) 
                    );
                });
            }

            if (info.authors) {
                info.authors.forEach( (author) => {
                    writer.addQuad(
                        quad(
                            namedNode(info.id),
                            namedNode(this.prefix_expand('schema:creator')),
                            namedNode(author)
                        )
                    );
                });
            }

            if (info.affiliation) {
                info.affiliation.forEach( (affiliation) => {
                    writer.addQuad(
                        quad(
                            namedNode(info.id),
                            namedNode(this.prefix_expand('schema:affiliation')),
                            namedNode(affiliation)
                        )
                    );
                });
            }
            
            writer.end((error, result) => {
                if (error) {
                    reject(error)
                }
                resolve(result);
            });
        });
    }
}