const program    = require('commander');
const cancelCopy = require('./lib/cancel_copy');
const generate   = require('./lib/generate');
const createSchedule = require('./lib/add_seances');


program
  .command('cancel-copy')
  .alias('c')
  .option('-p --playserver [model]', 'Model of playserver')
  .option('-s --stage [stage]')
  .description('Generate playlists')
  .action(async (options) => {
  	await cancelCopy(options);
  });

program
  .command('add-seances')
  .alias('a')
  .option('-p --playserver [model]', 'Model of playserver')
  .option('-s --stage [stage]')
  .option('-t --time-start <time>', 'Start time for first seance')
  .option('-c --count-seances <count>', 'Count ceances for day')
  .option('-d --days <days>', 'Count of days')
  .option('-o --offset <offset>', 'Forward offset relative to the current day')
  .description('Clear old seances and add new')
  .action(async(options) => {
  	await createSchedule(options);
  })

program
  .command('generate')
  .alias('g')
  .option('-p --playserver [model]', 'Model of playserver')
  .option('-s --stage [stage]')
  .option('-t --time-start <time>', 'Start time for first seance')
  .option('-c --count-seances <count>', 'Count ceances for day')
  .option('-d --days <days>', 'Count of days')
  .option('-o --offset <offset>', 'Forward offset relative to the current day')
  .description('Add new seances and generate playlists')
  .action(async(options) => {
    await generate(options);
  })

program.parse(process.argv);