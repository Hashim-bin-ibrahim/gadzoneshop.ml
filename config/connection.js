const mongoose = require('mongoose')

const server = '127.0.0.1:27017'; //db server
const dbname = 'endlessBlooms'; // database name

class Database{
    constructor(){
        this._connect()
    }
    _connect(){
        mongoose.connect(`mongodb://${server}/${dbname}`)
        .then(()=>{
            console.log("db connection successfull");
        })
        .catch(err =>{
            console.error('db connection error');
        })
    }
}

module.exports = new Database()