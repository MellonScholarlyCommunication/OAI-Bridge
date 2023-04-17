import log4js from 'log4js';
import { Harvester } from './Harvester.js';
import { program } from 'commander';

program.version('0.0.2')
       .argument('<baseurl>')
       .option('-c,--config <config>', 'components plugin file', './config.jsonld')
       .option('-d,--database <file>', 'database cache file', './cache.db')
       .option('-m,--metadataPrefix <prefix>', 'harvestable metadataPrefix', 'oai_dc')
       .option('-s,--setSpec <set>', 'harvestable set')
       .option('-t,--offset <number>', 'harvesting offset in days', parseInt)
       .option('-o,--outdir <directory>','output directory', './in')
       .option('--silent','do not produce output, only run the incremental harvester', false)
       .option('--max <number>','do not produce more than max number of records', parseInt)
       .option('--info','output debugging messages')
       .option('--debug','output more debugging messages')
       .option('--trace','output much more debugging messages');

program.parse(process.argv);

const opts   = program.opts();
const logger = log4js.getLogger();

if (opts.info) {
    logger.level = "info";
}

if (opts.debug) {
    logger.level = "debug";
}

if (opts.trace) {
    logger.level = "trace";
}

main();

async function main() {
    let baseUrl = program.args[0];

    let d = new Date();
    d.setDate(d.getDate() - (opts.offset || 1));
    let from = d.toISOString().replaceAll(/\.\d+Z$/g,'Z');

    let oai_options : any = { from : from };

    if (opts.setSpec) {
        oai_options['set'] = opts.setSpec;
    }

    const harvester = new Harvester(
                            logger,
                            opts.database,
                            baseUrl,
                            opts.metadataPrefix,
                            oai_options,
                            opts.outdir,
                            opts.config ,
                            {
                                silent: opts.silent ,
                                max: opts.max
                            }
                        );
    await harvester.harvest();
}