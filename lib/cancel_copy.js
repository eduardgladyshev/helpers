const request  = require('superagent');
const user     = require('../user.conf');

let agent = request.agent();


function getCinemaInfo(playserver){
  let cinema = {};
  
  switch (playserver){
    case 'dolby':
      cinema.hall      = 33980;
      cinema.id  = 1803;
      break;
    case 'christie': 
      cinema.hall      = 29186;
      cinema.id  = 2670;
      break;
    default:  //'doremi'
      cinema.hall      = 30255;
      cinema.id  = 1803;
      break;
  }

  return cinema;
}

function getUrl(value){
  const stageNum = (value === true) ? 2 : value;
  const urlProd  = 'https://kinoplan24.ru';
  const urlStage  = `http://stage${stageNum}.kinoplan.tk`;
  const url      = (value)? urlStage : urlProd; 
  
  return url;
}

async function login(url){
  console.log('invoke login to url: ', url);

  await agent
    .post(`${url}/login`)
    .type('form')
    .send({email: user.email, password: user.password});

  console.log('\nLogin');
}


async function cancelCopy(options){
  const playserver = options.playserver || 'doremi';
  const url        = getUrl(options.stage);
  const cinema     = getCinemaInfo(options.playserver);

  console.log('invoke cancelCopy with param :', playserver, url, cinema);
  
  try{
    await login(url);

    let res = await agent
      .get(`${url}/api/tms/content/v1/${cinema.id}/copying`);

    let transfers = res.body;

    let activeTransfers = transfers.filter(i => {
      return i.status != "finished" && i.status != "failed" && i.status != "remove";
    });

    console.log("Active transfers count", activeTransfers.length, "\n");

    activeTransfers.forEach(async i => {
      let res = await agent
        .patch(`${url}/api/tms/content/v1/2670/copy_control/${i.id}`)
        .send({"status":"remove"}); 

      console.log(i.filename, ": ", res.statusCode);
    });

  } catch(e){
    console.error(e);
  }

};

module.exports = cancelCopy;