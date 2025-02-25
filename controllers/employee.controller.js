const { s3Upload, s3Delete, s3Download } = require('../middleware/s3Service.middleware')
const Employee = require('../models/Employee');
const Notif = require('../middleware/notif.middleware');

module.exports = {

    addEmployee: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const salaryAmount = +(req.body.salary).split(',').join('');

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

            await newEmployee.save();
            await s3Upload(req.files['qidFile'][0], req.body.qid, 'employee');

            req.session.message = {
                type: 'success',
                message: 'New employee added successfully!',
            };

            res.redirect('/employee-list');
        } catch (err) {
            res.json({ message: err.message, type: 'danger' });
        }
    },


    viewEmployee: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const [foundEmployee, dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
                Employee.find(),
                Notif.getINV(),
                Notif.getVehicle(),
                Notif.getVehicleIn(),
                Notif.getEmployee()
            ]);

            const nav = {
                title: "Accounts",
                child: "Employee",
                view: 2,
                notif: {
                    exIstimara: dataVehicle,
                    exInsurance: dataVehicleIn,
                    expenPending: dataINV,
                    exQID: dataEmployee
                }
            };

            res.render('employee', {
                title: "Employee List",
                employeeList: foundEmployee,
                nav
            });
        } catch (err) {
            res.json({ message: err.message, type: 'danger' });
        }
    },


    updateEmployee: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            let id = req.params.id;
            const salaryAmount = +req.body.salary.replace(/,/g, "");

            // Update employee details
            const updatedEmployee = await Employee.findByIdAndUpdate(
                id,
                {
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
                },
                { new: true } // Return the updated document
            );

            if (!updatedEmployee) {
                return res.status(404).json({ message: "Employee not found!", type: "danger" });
            }

            // Handle QID file upload if provided
            if (req.files?.qidFile) {
                const qidFile = req.files.qidFile[0];

                // Upload new file to S3
                await s3Upload(qidFile, req.body.qid, "employee");

                // Delete old QID file from S3
                if (updatedEmployee.qid_file) {
                    await s3Delete(updatedEmployee.qid_file, "employee");
                }

                // Update employee record with new file name
                await Employee.findByIdAndUpdate(id, {
                    qid_file: `${qidFile.fieldname}-${req.body.qid}-${qidFile.originalname}`
                });
            }

            req.session.message = {
                type: "success",
                message: "Employee updated successfully!"
            };

            res.redirect("/employee-list");
        } catch (error) {
            console.error("Error updating employee:", error);
            res.status(500).json({ message: "Error updating employee", error: error.message });
        }
    },


    deleteEmployee: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            let id = req.params.id;

            // Find and delete employee
            const deletedEmployee = await Employee.findByIdAndRemove(id);

            if (!deletedEmployee) {
                return res.status(404).json({ message: "Employee not found!", type: "danger" });
            }

            // Delete QID file if it exists
            if (deletedEmployee.qid_file) {
                await s3Delete(deletedEmployee.qid_file, "employee");
            }

            req.session.message = {
                type: "info",
                message: "Employee deleted successfully!"
            };

            res.redirect("/employee-list");
        } catch (error) {
            console.error("Error deleting employee:", error);
            res.status(500).json({ message: "Error deleting employee", error: error.message });
        }
    },


    dlQID: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const { filename } = req.params;

            // Set response headers for file download
            res.attachment(filename);

            // Attempt to download the file from S3
            const fileStream = await s3Download(filename, "employee");

            // If no file is found, handle the error
            if (!fileStream) {
                return res.status(404).json({ message: "File not found!", type: "danger" });
            }

            // Pipe the file stream to response
            fileStream.pipe(res);
        } catch (error) {
            console.error("Error downloading QID file:", error);
            res.status(500).json({ message: "Error downloading file", error: error.message });
        }
    },

}