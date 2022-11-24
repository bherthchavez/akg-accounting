
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
                qid_file: req.files['qidFile'][0].filename,
                bank_name: req.body.bankName,
                iban: req.body.iban,
                salary: salaryAmount,
                company_id: req.user.company_id,
                status: 1,
                updated_by: req.user.name,
                created_by: req.user.name
            });
            newEmployee.save((err) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
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
                    res.json({ message: err.message });
                } else {

                    Notif.getINV((err, dataINV) => {
                        Notif.getVehicle((err, dataVehicle) => {
                            Notif.getEmployee((err, dataEmployee) => {


                    let nav = {
                        title: "Accounts",
                        child: "Employee",
                        view: 2,
                        notif: {
                            exIstimara: dataVehicle,
                            expenPending: dataINV,
                            exQID: dataEmployee
                        }
                    };

                    res.render('employee', {
                        title: "Employee List",
                        employeeList: foundEmployee,
                        nav: nav
                    })
                    })
                    })
                    })

                }
            });

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
            }, (err, result) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    if (req.files['qidFile']) { // new istimara
                        const filePath = path.join(__dirname, '../public/attachment/' + result.qid_file);
                        fs.unlink(filePath, (err) => { // remove old istimara
                            if (err) {
                                res.json({ message: err.message });
                            } else { //update new istimara to db
                                Employee.findByIdAndUpdate(id, {
                                    qid_file: req.files['qidFile'][0].filename,
                                }, (err) => {
                                    (err) && res.json({ message: err.message });
                                })
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

            Employee.findByIdAndRemove(id, (err, result) => {

                if (err) {
                    res.json({ message: err.message });
                } else {

                    const filePath = path.join(__dirname, '../public/attachment/' + result.qid_file);
                        fs.unlink(filePath, (err) => { // remove old istimara
                            if (err) {
                                res.json({ message: err.message });
                            }
                        })

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

            const filePath = path.join(__dirname, '../public/attachment/' + req.params.filename);
            console.log(filePath)

            res.download(
                filePath,
                req.params.filename, // Remember to include file extension

                (err) => {

                    if (err) {

                        res.json({ message: err.message });

                    } else {
                        console.log(filePath)
                    }

                });
        } else {
            res.redirect("/sign-in");
        }
    },
}