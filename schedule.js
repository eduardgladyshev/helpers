let request      = require('superagent');
let moment       = require('moment');
let argv         = require('minimist')(process.argv.slice(2));
let user         = require('./user.conf');
let seanceCount  = argv['count-seance'] || argv.c || 1;
let timeStart    = argv['time-start']   || argv.t || '10:00';
let playserver   = argv.playserver      || argv.p || 'doremi'
let days         = argv.days            || argv.d || 1;
let offset       = argv.offset          || argv.o || 0;
let env          = argv.env             || argv.e;
let url          = (env == 'dev') ? 'http://master.dev.kinoplan24.ru' : 'https://kinoplan24.ru';
let seances      = null;
let releaseId;
let cinemaId;
let hall;

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
    releaseId = 9685;
    break;
  case 'christie': 
    hall     = 29186;
    cinemaId = 2670;
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

  //TODO remove sales from mongo
}


agent
  .post(`${url}/login`)
  .type('form')
  .send({email: user.email, password: user.password})
  .then(res => {
    console.log('Login', res.body);

    return agent.
            get(`${url}/api/schedule/cinema/${cinemaId}/seances`)
            .query({date_start: `${getStartDate()}`, date_end: `${getEndDate()}`});
  })
  .then(res => {
    seances = res.body.seances.filter(i => i.hall_id == hall);
    
    console.log('Get seances', res.status);
    console.log('Found seances: ', seances.length);

    if(seances.length) {
      removeSeances();
    } else addSeances();

  })
  .catch(err => 
    console.log('err', err)
  );


function addSeances() {
  let schedule = [];
  let seances = [];
  let seance = {release_id: releaseId,hall_id: hall,formats:[1],title:null,duration:null}

  for(let i = 0; i < seanceCount; ++i) {
    seances.push(seance);
  }
  console.log('days', days);

  for(let i = 0; i < days; ++i){
    let day = {date_start: moment().add(i + offset, 'd').format('YYYY-MM-DD') ,time_start: timeStart,seances: seances};
    schedule.push(day)
  }

  schedule = JSON.stringify(schedule);

  agent
    .post(`${url}/api/schedule/cinema/${cinemaId}/seances`)
    .set('Content-Type', 'application/json')
    .send(schedule)
    .then(res => {
      let countAdvertising = res.body[0].advertising.filter(i => i.length > 4).length;

      console.log('Add seances', res.status);
      console.log('Count advertising:', countAdvertising);

      return agent
        .put(`${url}/api/schedule/cinema/${cinemaId}/approve`)
        .set('Content-Type', 'application/json')
        .send(`{"date_start":"${getStartDate()}","date_end":"${getEndDate()}","hall_id":${hall},"approved":true}`)
    })
    .then(res => {
      console.log('Approve schedule', res.status);

      return agent
        .post(`${url}/api/tms/shows/v2/${cinemaId}/generate`)
        .set('Content-Type', 'application/json')
        .send(`{"date_start":"${getStartDate()}","date_end":"${getEndDate()}","halls":[${hall}]}`)
    })
    .then(res => {
      console.log('Generate SPLs', res.status);
    })
    .catch(err => console.log(err))
}


function removeSeances(){
  checkSales(seances);

  agent
    .put(`${url}/api/schedule/cinema/${cinemaId}/approve`)
    .set('Content-Type', 'application/json')
    .send(`{"date_start":"${getStartDate()}","date_end":"${getEndDate()}","hall_id":${hall},"approved":false}`)
    .then(res => {
      console.log('Unapprove', res.status);

      let seanceIds = JSON.stringify(seances.map(i => i.id));

      return agent
        .delete(`${url}/api/schedule/cinema/${cinemaId}/seances`)
        .set('Content-Type', 'application/json')
        .send(seanceIds)
    })
    .then(res => {
      console.log('Delete seances', res.status)

      addSeances();      
    })
    .catch(err => console.log(err))
}