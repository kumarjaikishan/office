const mongo = require('mongoose');

mongo.set('strictQuery', false);
mongo.connect(process.env.db).then(()=>{
 console.log("connection to Mongodb successful");
}).catch((e)=>{
    console.log(e)
})