const { s3Upload, s3Delete, s3Download } = require('../middleware/s3Service.middleware')
const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');

const Notif = require('../middleware/notif.middleware');

module.exports = {

    addEmployee: async (req, res) => {
        if (req.isAuthenticated()) {

            const salaryAmount = + (req.body.salary).split(',').join('');

            const newEmployee = new Employee({
                fname: req.body.fName,
                mname: req.body.mName,
                lname: req.body.lName,
                gender: req.body.gender,
                email: req.body.email,
                contact_no: req.body.cNo,
                address: req.body.address,
                qid: req.body.qid,
                ex_qid: req.body.exQID,
                qid_file: `${req.files['qidFile'][0].fieldname}-${req.body.qid}-${req.files['qidFile'][0].originalname}`,
                bank_name: req.body.bankName,
                iban: req.body.iban,
                salary: salaryAmount,
                company_id: req.user.company_id,
                status: 1,
                updated_by: req.user.name,
                created_by: req.user.name
            });
            newEmployee.save(async(err) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    const s3UpQID = await s3Upload(req.files['qidFile'][0], req.body.qid, 'employee');
                    
                    req.session.message = {
                        type: 'success',
                        message: 'New employee added successfully!',
                    };
                    res.redirect('/employee-list');
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    viewEmployee: async (req, res) => {
        if (req.isAuthenticated()) {

            Employee.find().exec((err, foundEmployee) => {
                if (err) {
                    res.json({ message: err.message })
                } else {

                    Notif.getINV((err, dataINV) => {
                        Notif.getVehicle((err, dataVehicle) => {
                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                Notif.getEmployee((err, dataEmployee) => {


                                    let nav = {
                                        title: "Accounts",
                                        child: "Employee",
                                        view: 2,
                                        notif: {
                                            exIstimara: dataVehicle,
                                            exInsurance: dataVehicleIn,
                                            expenPending: dataINV,
                                            exQID: dataEmployee
                                        }
                                    }

                                    res.render('employee', {
                                        title: "Employee List",
                                        employeeList: foundEmployee,
                                        nav: nav
                                    })
                                })
                            })
                        })
                    })

                }
            })

        } else {
            res.redirect("/sign-in");
        }

    },

    updateEmployee: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;
            const salaryAmount = + (req.body.salary).split(',').join('');

            Employee.findByIdAndUpdate(id, {
                fname: req.body.fName,
                mname: req.body.mName,
                lname: req.body.lName,
                gender: req.body.gender,
                email: req.body.email,
                contact_no: req.body.cNo,
                address: req.body.address,
                qid: req.body.qid,
                ex_qid: req.body.exQID,
                bank_name: req.body.bankName,
                iban: req.body.iban,
                salary: salaryAmount,
                updated_by: req.user.name
            },async (err, result) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    if (req.files['qidFile']) { // new istimara

                        const S3up = await s3Upload(req.files['qidFile'][0], req.body.qid,'employee');
                       
                        Employee.findByIdAndUpdate(id, {
                            qid_file: `${req.files['qidFile'][0].fieldname}-${req.body.qid}-${req.files['qidFile'][0].originalname}`,
                        }, async(err) => {
                           if (err) {
                             res.json({ message: err.message });
                           }else{
                            const S3del = await s3Delete(result.qid_file,'employee')
                           }
                        })
                    }

                    req.session.message = {
                        type: 'success',
                        message: 'Employee updated successfully!'
                    };

                    res.redirect('/employee-list')
                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },

    deleteEmployee: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Employee.findByIdAndRemove(id, async(err, result) => {

                if (err) {
                    res.json({ message: err.message });
                } else {

                                // delete file  QID FILE
                                const s3Del1 = await s3Delete(result.qid_file,'employee')

                    req.session.message = {
                        type: 'info',
                        message: 'Employee deleted successfully!',
                    };
                    res.redirect('/employee-list')
                }

            });



        } else {
            res.redirect("/sign-in");
        }
    },

    dlQID: async (req, res) => {
        if (req.isAuthenticated()) {

            res.attachment(req.params.filename);
            const fileStream = await s3Download(req.params.filename, 'employee');
            fileStream.pipe(res);

        } else {
            res.redirect("/sign-in");
        }
    },
}