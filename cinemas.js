let request  = require('superagent');
let user     = require('./user.conf');
let MongoClient = require('mongodb').MongoClient;
require('console.table');

let cinemas  = [];
let cinemaList = [];


const url = 'mongodb://10.30.0.8:27017';


const dbName = 'kinoplan';


MongoClient.connect(url, function(err, client) {
  if(err) throw err; 
  console.log("Connected successfully to mongo");

  const db = client.db(dbName);

  let cinemaCollection = db.collection('cinema');
  cinemaCollection.find({'owner': })

  client.close();
});













// let agent = request.agent();

// agent
//   .post(`https://kinoplan24.ru/login`)
//   .type('form')
//   .send({email: user.email, password: user.password})
//   .then(res => {
//     return agent.
//             get(`https://kinoplan24.ru/api/user/v2/0`);
//   })
//   .then(res => {
//     cinemas = res.body.cinema;

//     cinemas.forEach(i => {
//       cinemaList.push({'Название': i.title.ru, id: i.id, node: i.dd24_pro});
//     });
    
//     console.table('Список кинотеатров', cinemaList);

//     handleCinemaId();

//   })
//   .catch(err => console.log('err', err));
  
// function handleCinemaId(){

//   process.stdin.on('readable', () => {
//     let cinemaId = process.stdin.read();

//     if(!+cinemaId && cinemaId !== null) {
//       console.table('Список кинотеатров', cinemaList);
//     }

//     cinemas.forEach(i => {
//       let halls = []; 

//       if(i.id == cinemaId){
//         i.halls.forEach(i => {
//           halls.push({'Номер': i.title, id: i.id});
//         });

//         console.table('Список залов', halls);
//       } 
//     });

//     process.stdout.write(`Id кинотеатра: `);
//   });

//   process.stdin.on('end', () => {
//     process.stdout.write('end');
//   });
// }

