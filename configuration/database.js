const mongoose=require("mongoose");

const connectDataBase = ()=>{
    // useNewUrlParser === allow user to fallback t old parser if they find a bug in new parser.
    // useUnifiedTopology=== remove support for several connection options which is not relevent with new topology.
    mongoose.connect(process.env.DB_CONN_URI,{useNewUrlParser: true,useUnifiedTopology:true,})
        .then((data)=>{
            console.log(`Mongodb connected with server : ${data.connection.host}`);
        })
}

module.exports = connectDataBase;