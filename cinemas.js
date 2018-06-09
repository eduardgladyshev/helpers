let request  = require('superagent');
let user     = require('./user.conf');
let MongoClient = require('mongodb').MongoClient;
require('console.table');

let cinemas  = [];
let cinemaList = [];

const url = 'mongodb://10.30.0.8:27017';
const dbName = 'kinoplan';

try{
  (async function(){
    cinemas = await new Promise(function(resolve){
      MongoClient.connect(url, function(err, client) {
        if(err) throw err; 

        const db = client.db(dbName);
        let cinemaCollection = db.collection('cinema');

        cinemaCollection
          .find({$or: [{"id": 1803}, {"id": 2670}, {"cinema_network.id": 484}, {"cinema_network.id": 512}] })
          .toArray(function(err, res){
            if(err) throw err;
            resolve(res);
          })

        client.close();
      });  
    });

    cinemas.forEach(i => {
      cinemaList.push({'Название': i.title.ru, id: i.id, node: i.dd24_pro});
    });
        
    console.table('Список кинотеатров', cinemaList);
    handleCinemaId();
  }());

} catch(e){
  console.log(e);
}


function handleCinemaId(){

  process.stdin.on('readable', () => {
    let cinemaId = process.stdin.read();

    if(!+cinemaId && cinemaId !== null) {
      console.table('Список кинотеатров', cinemaList);
    }

    cinemas.forEach(i => {
      let halls = []; 

      if(i.id == cinemaId){
        i.halls.forEach(i => {
          halls.push({'Номер': i.title, id: i.id});
        });

        console.table('Список залов', halls);
      } 
    });

    process.stdout.write(`Id кинотеатра: `);
  });

  process.stdin.on('end', () => {
    process.stdout.write('end');
  });
}

