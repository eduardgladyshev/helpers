function getUrl(value){
  const stageNum = (value === true) ? 2 : value;
  const urlProd  = 'https://kinoplan24.ru';
  const urlStage = `http://stage${stageNum}.kinoplan.tk`;
  const url      = (value)? urlStage : urlProd; 
  
  return url;
}

module.exports = getUrl;