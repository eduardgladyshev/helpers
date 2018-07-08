const moment  = require('moment');

function getStartDate(offset){
  return moment().add(offset, 'd').format('YYYY-MM-DD');
}

function getEndDate(offset, days){
  if(days > 1){
  	console.log(typeof(offset), typeof(days), days - 1 + offset);     
    return moment().add(days - 1 + offset, 'd').format('YYYY-MM-DD');
  } else {
    return moment().add(offset, 'd').format('YYYY-MM-DD');
  }
}

module.exports = {getStartDate, getEndDate};