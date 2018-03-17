let request      = require('superagent'),
    moment       = require('moment'),
    argv         = require('minimist')(process.argv.slice(2)),
    user         = require('./user.conf'),
    seanceCount  = argv['count-seance'] || argv.c || 1,
    timeStart    = argv['time-start']   || argv.t || '10:00',
    playserver   = argv.playserver      || argv.p || 'doremi',
    days         = argv.days            || argv.d || 1,
    offset       = argv.offset          || argv.o || 0,
    env          = argv.env             || argv.e,
    onlySchedule = argv.s || false,
    url          = (env == 'stage') ? 'http://stage2.kinoplan.tk' : 'https://kinoplan24.ru',
    seances      = null,
    releaseId,
    cinemaId,
    hall;

let agent = request.agent();

switch (playserver){
  case 'doremi':
    hall      = 30255;
    cinemaId  = 1803;
    releaseId = 9685;
    break;
  case 'dolby':
    hall      = 33980;
    cinemaId  = 1803;
    releaseId = 10135;
    break;
  case 'christie': 
    hall      = 29186;
    cinemaId  = 2670;
    releaseId = 5727;
    break;
  default:
    throw new Error('wrong playserver name');
}

function getStartDate(){
  return moment().add(offset, 'd').format('YYYY-MM-DD');
}

function getEndDate(){
  if(days > 1){
    return moment().add(days - 1 + offset, 'd').format('YYYY-MM-DD');
  } else {
    return moment().add(offset, 'd').format('YYYY-MM-DD');
  }
}

function checkSales(seances){
  let seancesWithSales = seances.filter(i => i.is_on_sale);

  if(seancesWithSales.length) throw new Error('Has open sale seances');
}

async function addSeances() {
  let schedule = [];
  let seances = [];
  let seance = {release_id: releaseId,hall_id: hall,formats:[1],title:null,duration:null}

  for(let i = 0; i < seanceCount; ++i) {
    seances.push(seance);
  }

  for(let i = 0; i < days; ++i){
    let day = {date_start: moment().add(i + offset, 'd').format('YYYY-MM-DD') ,time_start: timeStart,seances: seances};
    schedule.push(day)
  }

  schedule = JSON.stringify(schedule);

  let seancesRes = await agent
    .post(`${url}/api/schedule/cinema/${cinemaId}/seances`)
    .set('Content-Type', 'application/json')
    .send(schedule);

  console.log('Add seances', seancesRes.status);

  let countAdvertising = seancesRes.body[0].advertising.filter(i => i.length > 4).length;

  changeApproved(true);

  if(!onlySchedule) generateSpls();
}

async function changeApproved(boolean){
  let approveRes = await agent
    .put(`${url}/api/schedule/cinema/${cinemaId}/approve`)
    .set('Content-Type', 'application/json')
    .send(`{"date_start":"${getStartDate()}","date_end":"${getEndDate()}","hall_id":${hall},"approved":${boolean}}`);

  console.log(`Schedule ${boolean ? 'approved' : 'unapproved'}`, approveRes.status);
} 

async function generateSpls(){
  let genRes = await agent
    .post(`${url}/api/tms/shows/v2/${cinemaId}/generate`)
    .set('Content-Type', 'application/json')
    .send(`{"date_start":"${getStartDate()}","date_end":"${getEndDate()}","halls":[${hall}]}`);

  console.log(`Generate SPLs ${genRes.status}\n`);
}

async function removeSeances(){
  checkSales(seances);
  changeApproved(false);

  let seanceIds = JSON.stringify(seances.map(i => i.id));

  console.log('ids', seanceIds);

  let deleteSeancesRes = await agent
    .delete(`${url}/api/schedule/cinema/${cinemaId}/seances`)
    .set('Content-Type', 'application/json')
    .send(seanceIds);

  console.log('Delete seances', deleteSeancesRes.status);

  let seancesRes = await agent
    .get(`${url}/api/schedule/cinema/${cinemaId}/seances`)
    .query({date_start: `${getStartDate()}`, date_end: `${getEndDate()}`});

  console.log('seancesAfterDeleteng', seancesRes.body.seances.filter(i => i.hall_id == hall));

  addSeances(); 
}

(async function(){
  await agent
    .post(`${url}/login`)
    .type('form')
    .send({email: user.email, password: user.password});

  console.log('\nLogin');

  let seancesRes = await agent
    .get(`${url}/api/schedule/cinema/${cinemaId}/seances`)
    .query({date_start: `${getStartDate()}`, date_end: `${getEndDate()}`});

  seances = seancesRes.body.seances.filter(i => i.hall_id == hall);
      
  console.log('Get seances', seancesRes.status);
  console.log('Found seances: ', seances.length);

  if(seances.length) {
    removeSeances();
  } else addSeances();

}());    