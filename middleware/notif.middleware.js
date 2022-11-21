const Employee = require('../models/Employee');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');


module.exports = {
     getINV: (callback) =>{
        Invoice.find({status: 2}, (err, data) =>{
          if(!err && data){
           // no error and data is available , so pass err as null and data as data[0] to callback
          return callback(null,data);
          }else{
           // error occured , pass err as err and data = null to callback
           return callback(err,null);
          }
       });
    },
    getVehicle: (callback) =>{
        Vehicles.find({ istimara_exdate: { $lte: new Date(new Date().setDate(new Date().getDate() + 1)) } }, (err, data) => {
          if(!err && data){
           // no error and data is available , so pass err as null and data as data[0] to callback
          return callback(null,data);
          }else{
           // error occured , pass err as err and data = null to callback
           return callback(err,null);
          }
       });
    },
    getEmployee: (callback) =>{
        Employee.find({ ex_qid: { $lte: new Date(new Date().setDate(new Date().getDate() + 1)) } }, (err, data) => {
          if(!err && data){
           // no error and data is available , so pass err as null and data as data[0] to callback
          return callback(null,data);
          }else{
           // error occured , pass err as err and data = null to callback
           return callback(err,null);
          }
       });
    }
 }