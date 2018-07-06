const program    = require('commander');
const cancelCopy = require('./lib/cancel_copy');


program
  .command('cancel-copy')
  .alias('c')
  .option('-p --playserver [model]', 'Model of playserver')
  .option('-s --stage [stage]')
  .description('Generate playlists')
  .action(async (options) => {
  	console.log('invoke callback function from programm');
  	await cancelCopy(options);
  });

program.parse(process.argv);

// console.log('\n\n\n_ _ _', program);