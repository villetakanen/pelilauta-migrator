import yargs from 'yargs';
import { migrate } from "./migrator.js";

// ** Parse command line arguments ********************************************

const y = yargs(process.argv.slice(2))
const argv = y
  .option('site', {
    alias: 's',
    describe: 'Site name to migrate, the site shoud exist as a subdirectory of ./import',
    demandOption: true,
    type: 'string',
  })
  .option('owner', {
    alias: 'o',
    describe: 'Owner uid, defaults to the initia site owner uid',
    demandOption: false,
    type: 'string',
  })
  .option('force', {
    alias: 'f',
    describe: 'Force migration even if the site already exists',
    demandOption: false,
    type: 'boolean',
  })
  .help()
  .alias('help', 'h').argv;

const { site, owner, force } = await argv;

migrate(site, owner, force);