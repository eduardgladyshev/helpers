function getCinemaInfo(playserver){
  let cinema = {};
  
  switch (playserver){
    case 'dolby':
      cinema.hall      = 33980;
      cinema.id  = 1803;
      cinema.releaseId = 10135;
      break;
    case 'christie': 
      cinema.hall      = 29186;
      cinema.id  = 2670;
      cinema.releaseId = 10661;
      break;
    default:  //'doremi'
      cinema.hall      = 30255;
      cinema.id  = 1803;
      cinema.releaseId = 9685;
      break;
  }

  return cinema;
}

module.exports = getCinemaInfo;