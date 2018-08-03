const {getStartDate, getEndDate} = require('./helpers/getDate');
const createSchedule = require('./add_seances');
const getUrl         = require('./helpers/getUrl');
const getCinemaInfo  = require('./helpers/getCinemaInfo');

async function generateSpls(options){
  const url    = getUrl(options.stage);
  const cinema = getCinemaInfo(options);
  const offset = +options.offset || 0;
  const days   = +options.days  || 1;

  let agent = await createSchedule(options);

  let genRes = await agent
    .post(`${url}/api/tms/shows/v2/${cinema.id}/generate`)
    .set('Content-Type', 'application/json')
    .send(`{"date_start":"${getStartDate(offset)}","date_end":"${getEndDate(offset, days)}","halls":[${cinema.hall}]}`);

  console.log(`Generate SPLs ${genRes.status}\n`);

}

module.exports = generateSpls;