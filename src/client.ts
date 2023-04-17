import log4js from 'log4js';
import { Harvester } from './Harvester.js';
import { program } from 'commander';

program.version('0.0.1')
       .argument('<baseurl>')
       .option('-c,--config <config>', 'components plugin file', './config.jsonld')
       .option('-d,--database <file>', 'database cache file', './cache.db')
       .option('-m,--metadataPrefix <prefix>', 'harvestable metadataPrefix', 'oai_dc')
       .option('-t,--offset <days>', 'harvesting offset in days', parseInt, -2)
       .option('-o,--outdir <directory>','output directory', './in')
       .option('-d,--info','output debugging messages')
       .option('-dd,--debug','output more debugging messages')
       .option('-ddd,--trace','output much more debugging messages');

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
    d.setDate(d.getDate() + opts.offset);
    let from = d.toISOString().replaceAll(/\.\d+Z$/g,'Z');

    const harvester = new Harvester(
                            logger,
                            opts.database,
                            baseUrl,
                            opts.metadataPrefix,
                            { from: from },
                            opts.outdir,
                            opts.config
                        );
    await harvester.harvest();
}