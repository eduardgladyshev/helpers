const request  = require('superagent');
const login    = require('./helpers/login');
const getUrl   = require('./helpers/getUrl');
const getCinemaInfo = require('./helpers/getCinemaInfo');

let agent;

async function cancelCopy(options){
  const playserver = options.playserver || 'doremi';
  const url        = getUrl(options.stage);
  const cinema     = getCinemaInfo(options.playserver);

  console.log('invoke cancelCopy with param :', playserver, url, cinema);
  
  try{
    agent = await login(url);

    let res = await agent
      .get(`${url}/api/tms/content/v1/${cinema.id}/copying`);

    let transfers = res.body;

    let activeTransfers = transfers.filter(i => {
      return i.status != "finished" && i.status != "failed" && i.status != "remove";
    });

    console.log("Active transfers count", activeTransfers.length, "\n");

    activeTransfers.forEach(async i => {
      let res = await agent
        .patch(`${url}/api/tms/content/v1/${cinema.id}/copy_control/${i.id}`)
        .send({"status":"remove"}); 

      console.log(i.filename, ": ", res.statusCode);
    });

  } catch(e){
    console.error(e);
  }

};

module.exports = cancelCopy;