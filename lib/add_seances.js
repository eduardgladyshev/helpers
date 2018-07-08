const request = require('superagent');
const moment  = require('moment');
const login   = require('./helpers/login');
const getUrl   = require('./helpers/getUrl');
const getCinemaInfo = require('./helpers/getCinemaInfo');

let url, agent, cinema, offset, days, count, time;


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

function addSeances() {
  let schedule = [];
  let seances = [];
  let seance = {release_id: cinema.releaseId, hall_id: cinema.hall,formats:[1],title:null,duration:null}

  for(let i = 0; i < count; ++i) {
    seances.push(seance);
  }


  for(let i = 0; i < days; ++i){
    let day = {date_start: moment().add(i + offset, 'd').format('YYYY-MM-DD'), time_start: time, seances: seances};
    schedule.push(day);
  }

  schedule = JSON.stringify(schedule);

  return agent
    .post(`${url}/api/schedule/cinema/${cinema.id}/seances`)
    .set('Content-Type', 'application/json')
    .send(schedule);

}

function changeApproved(boolean){
  return agent
    .put(`${url}/api/schedule/cinema/${cinema.id}/approve`)
    .set('Content-Type', 'application/json')
    .send(`{"date_start":"${getStartDate()}","date_end":"${getEndDate()}","hall_id":${cinema.hall},"approved":${boolean}}`);
} 

function removeSeances(seances){
  checkSales(seances);

  let seanceIds = JSON.stringify(seances.map(i => i.id));

  return agent
    .delete(`${url}/api/schedule/cinema/${cinema.id}/seances`)
    .set('Content-Type', 'application/json')
    .send(seanceIds);
}

async function createSchedule(options){
  cinema = getCinemaInfo(options.playserver);
  url    = getUrl(options.stage);
  count  = options.countSeances || 1;
  time   = options.timeStart  || "10:00";
  offset = +options.offset || 0;
  days   = +options.days  || 1;
  
  try{
    agent = await login(url);

    let seancesRes = await agent
      .get(`${url}/api/schedule/cinema/${cinema.id}/seances`)
      .query({date_start: `${getStartDate()}`, date_end: `${getEndDate()}`});

    let seances = seancesRes.body.seances.filter(i => i.hall_id == cinema.hall);
        
    console.log('Get seances', seancesRes.status);
    console.log('Found seances: ', seances.length);

    if(seances.length) {
      let approveRes = await changeApproved(false);
      console.log('Schedule unapproved', approveRes.status);

      let removeRes = await removeSeances(seances);
      console.log('Delete seances', removeRes.status);
    }

    let addRes = await addSeances();
    console.log('Add seances', addRes.status);

    let approveRes = await changeApproved(true);
    console.log('Approve schedule', approveRes.status);

    return agent;

  } catch (e){
    console.error(e);
  }

}

module.exports = createSchedule;