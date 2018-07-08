const request = require('superagent');
const user    = require('../../user.conf');
let   agent   = request.agent();

async function login(url){
  await agent
    .post(`${url}/login`)
    .type('form')
    .send({email: user.email, password: user.password});

  console.log('\nLogin');

  return agent;
}

module.exports = login;