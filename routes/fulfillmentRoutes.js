const {WebhookClient} = require('dialogflow-fulfillment');
const axios = require('axios');
const mongoose = require('mongoose');
const Demand = mongoose.model('demand');
const Coupon = mongoose.model('coupon');
const Registration = mongoose.model('registration');

module.exports = app => {
    app.post('/', async (req, res) => {
        const agent = new WebhookClient({ request: req, response: res });

        function snoopy(agent) {
            agent.add(`Welcome to my Cannabot fulfillment!`);
        }

        async function solve_headache(agent) {
            let result;
              await axios.get('http://localhost:4000/api/strains/filter?name=&race=&medical=Headache&positive=&flavour=')
              .then(response=>{
                  let strains = response.data.map(strain=>strain.name);
                   strains =strains.slice(0,5).join(", ")
                  console.log(strains)
                  result= strains
                  console.log("estoy en el axios")
              })
              .catch(err=>{err})

            console.log(result)
            agent.add(`Te voy a dar cosita buena...\n ${result}`);
        }

        async function like_flavor(agent) {
            let result;
            await axios.get('http://localhost:4000/api/strains/filter?name=&race=&medical=&positive=&flavour=mint')
              .then(response=>{
                  let strains = response.data.map(strain=>strain.name);
                  strains =strains.slice(0,5).join(", ")
                  //console.log(strains)
                  result= strains
                  //console.log("estoy en el axios")
              })
              .catch(err=>{err})

            //console.log(result)
            agent.add(`Esto está muuuuuu rico...\n ${result}`);
        }

/*        async function registration(agent) {

            const registration = new Registration({
                name: agent.parameters.name,
                address: agent.parameters.address,
                phone: agent.parameters.phone,
                email: agent.parameters.email,
                dateSent: Date.now()
            });
            try{
                let reg = await registration.save();
                console.log(reg);
            } catch (err){
                console.log(err);
            }
        }*/

/*        async function learn(agent) {

            Demand.findOne({'course': agent.parameters.courses}, function(err, course) {
                if (course !== null ) {
                    course.counter++;
                    course.save();
                } else {
                    const demand = new Demand({course: agent.parameters.courses});
                    demand.save();
                }
            });
            let responseText = `You want to learn about ${agent.parameters.courses}. 
                    Here is a link to all of my courses: https://www.udemy.com/user/jana-bergant`;

            let coupon = await Coupon.findOne({'course': agent.parameters.courses});
            if (coupon !== null ) {
                responseText = `You want to learn about ${agent.parameters.courses}. 
                Here is a link to the course: ${coupon.link}`;
            }

            agent.add(responseText);
        }*/

        function fallback(agent) {
            agent.add(`I didn't understand`);
            agent.add(`I'm sorry, can you try again?`);
        }

        let intentMap = new Map();
        intentMap.set('snoopy', snoopy);
        //intentMap.set('learn courses', learn);
        //intentMap.set('recommend courses - yes', registration);
        intentMap.set('cure headache', solve_headache);
        intentMap.set('like mint', like_flavor);
        intentMap.set('Default Fallback Intent', fallback);

        agent.handleRequest(intentMap);
    });

}