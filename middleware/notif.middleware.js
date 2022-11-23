const Employee = require('../models/Employee');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');


module.exports = {
     getINV: (callback) =>{
        Invoice.find({status: 2}, (err, data) =>{
          if(!err && data){
          return callback(null,data);
          }else{
           return callback(err,null);
          }
       });
    },
    getVehicle: (callback) =>{
        Vehicles.find({ istimara_exdate: { $lte: new Date(new Date().setDate(new Date().getDate() + 0)) } }, (err, data) => {
          if(!err && data){
          return callback(null,data);
          }else{
           return callback(err,null);
          }
       });
    },
    getEmployee: (callback) =>{
        Employee.find({ ex_qid: { $lte: new Date(new Date().setDate(new Date().getDate() + 0)) } }, (err, data) => {
          if(!err && data){
          return callback(null,data);
          }else{
           return callback(err,null);
          }
       });
    }
 }