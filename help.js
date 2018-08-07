#! /usr/bin/env node

const program    = require('commander');
const cancelCopy = require('./lib/cancel_copy');
const generate   = require('./lib/generate');
const createSchedule = require('./lib/add_seances');


program
  .command('cancel-copy')
  .alias('c')
  .option('-p --playserver [model]', 'Model of playserver, e.g. dolby')
  .option('-s --stage [stage]', 'Execute on stage')
  .description('Cancel all active transfers')
  .action(async (options) => {
  	await cancelCopy(options);
  });

program
  .command('add-seances')
  .alias('a')
  .option('-p --playserver [model]', 'Model of playserver')
  .option('-s --stage [stage]', 'Execute on stage')
  .option('-t --time-start <time>', 'Start time for first seance')
  .option('-c --count-seances <count>', 'Count ceances for day')
  .option('-d --days <days>', 'Count of days')
  .option('-o --offset <offset>', 'Forward offset relative to the current day')
  .option('-r --release <release>', 'Release id')
  .description('Add new approved seances')
  .action(async(options) => {
  	await createSchedule(options);
  })

program
  .command('generate-spls')
  .alias('g')
  .option('-p --playserver [model]', 'Model of playserver')
  .option('-s --stage [stage]')
  .option('-t --time-start <time>', 'Start time for first seance')
  .option('-c --count-seances <count>', 'Count ceances for day')
  .option('-d --days <days>', 'Count of days')
  .option('-o --offset <offset>', 'Forward offset relative to the current day')
  .option('-r --release <release>', 'Release id')
  .description('Add new seances and generate playlists')
  .action(async(options) => {
    await generate(options);
  })

program.parse(process.argv);