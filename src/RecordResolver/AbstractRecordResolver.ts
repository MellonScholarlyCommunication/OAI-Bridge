import { getLogger, Logger } from "log4js";

export interface IFileType {
    id: string ,
    mediaType? : string ,
    access?: string,
    type: string[]
};

export interface IRecordType {
    title? : string ,
    year? : string ,
    doi? : string ,
    authors? : string[] ,
    affiliation? : string[] ,
    file? : IFileType[]
};

export abstract class AbstractRecordResolver {
    logger : Logger ;

    constructor() {
        this.logger = getLogger();
    }

    public abstract resolve(oai_id: string) : Promise<string>;

    public abstract metadata(url: string) : Promise<IRecordType | null>;
}