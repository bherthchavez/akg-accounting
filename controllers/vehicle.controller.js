const { s3Upload, s3Delete, s3Download } = require('../middleware/s3Service.middleware')
const Vehicles = require('../models/Vehicles');
const Voucher = require('../models/Voucher');

const Notif = require('../middleware/notif.middleware');

module.exports = {

    addVehicle: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const { vehicleNo, makeModel, regOwner, regDate, exDate, exDateIn } = req.body;
            const istimaraFile = req.files['istimaraFile'][0];
            const insuranceFile = req.files['insuranceFile'][0];

            const newVehicle = new Vehicles({
                vehicle_no: vehicleNo,
                make_model: makeModel,
                registered_owner: regOwner,
                registered_date: regDate,
                istimara_exdate: exDate,
                istimara_file: `${istimaraFile.fieldname}-${vehicleNo}-${istimaraFile.originalname}`,
                insurance_exdate: exDateIn,
                insurance_file: `${insuranceFile.fieldname}-${vehicleNo}-${insuranceFile.originalname}`,
                expenses: 0.0,
                income: 0.0,
                status: 1,
                created_by: req.user.name
            });

            await newVehicle.save();

            // Upload files to S3 in parallel
            await Promise.all([
                s3Upload(istimaraFile, vehicleNo, "vehicle"),
                s3Upload(insuranceFile, vehicleNo, "vehicle")
            ]);

            req.session.message = {
                type: "success",
                message: "Vehicle added successfully!",
            };

            res.redirect("/vehicle-list");

        } catch (error) {
            console.error("Error adding vehicle:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },


    viewVehicles: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const [foundVehicles, dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
                Vehicles.find(),
                Notif.getINV(),
                Notif.getVehicle(),
                Notif.getVehicleIn(),
                Notif.getEmployee()
            ]);

            const nav = {
                title: "Accounts",
                child: "Vehicle",
                view: 2,
                notif: {
                    exIstimara: dataVehicle,
                    exInsurance: dataVehicleIn,
                    expenPending: dataINV,
                    exQID: dataEmployee
                }
            };

            res.render('vehicle', {
                title: "Vehicle List",
                vehicleList: foundVehicles,
                nav
            });
        } catch (err) {
            res.json({ message: err.message, type: 'danger' });
        }
    },


    updateVehicles: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const id = req.params.id;
            const vehicle = await Vehicles.findById(id);

            if (!vehicle) {
                return res.json({ message: "Vehicle not found", type: "danger" });
            }

            // Update basic vehicle details
            const updatedVehicle = await Vehicles.findByIdAndUpdate(
                id,
                {
                    vehicle_no: req.body.vehicleNo,
                    make_model: req.body.makeModel,
                    registered_owner: req.body.regOwner,
                    registered_date: req.body.regDate,
                    istimara_exdate: req.body.exDate,
                    insurance_exdate: req.body.exDateIn,
                },
                { new: true }
            );

            // Handle Istimara file upload
            if (req.files?.istimaraFile) {
                await s3Upload(req.files.istimaraFile[0], req.body.vehicleNo, "vehicle");

                await Vehicles.findByIdAndUpdate(id, {
                    istimara_file: `${req.files.istimaraFile[0].fieldname}-${req.body.vehicleNo}-${req.files.istimaraFile[0].originalname}`,
                });

                if (vehicle.istimara_file) {
                    await s3Delete(vehicle.istimara_file, "vehicle");
                }
            }

            // Handle Insurance file upload
            if (req.files?.insuranceFile) {
                await s3Upload(req.files.insuranceFile[0], req.body.vehicleNo, "vehicle");

                await Vehicles.findByIdAndUpdate(id, {
                    insurance_file: `${req.files.insuranceFile[0].fieldname}-${req.body.vehicleNo}-${req.files.insuranceFile[0].originalname}`,
                });

                if (vehicle.insurance_file) {
                    await s3Delete(vehicle.insurance_file, "vehicle");
                }
            }

            req.session.message = {
                type: "success",
                message: "Vehicle updated successfully!",
            };

            res.redirect("/vehicle-list");
        } catch (error) {
            console.error("Error updating vehicle:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },


    deleteVehicle: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const id = req.params.id;
            const vehicle = await Vehicles.findById(id);

            if (!vehicle) {
                req.session.message = { type: "danger", message: "Vehicle not found!" };
                return res.redirect("/vehicle-list");
            }

            // Check if the vehicle has financial records
            if (vehicle.income !== 0 || vehicle.expenses !== 0) {
                req.session.message = {
                    type: "danger",
                    message: `${vehicle.supplier_name}: cannot be deleted since it has one or more entries!`,
                };
                return res.redirect("/vehicle-list");
            }

            // Remove vehicle record
            await Vehicles.findByIdAndRemove(id);

            // Delete associated files from S3
            if (vehicle.istimara_file) await s3Delete(vehicle.istimara_file, "vehicle");
            if (vehicle.insurance_file) await s3Delete(vehicle.insurance_file, "vehicle");

            req.session.message = { type: "info", message: "Vehicle deleted successfully!" };
            res.redirect("/vehicle-list");

        } catch (error) {
            console.error("Error deleting vehicle:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },


    viewRentInfo: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const { id } = req.params;
            const voucher = await Voucher.findById(id);

            if (!voucher) {
                req.session.message = {
                    type: "danger",
                    message: "Transaction cannot be viewed. Error: Voucher not found.",
                };
                return res.redirect("/");
            }

            req.session.message = {
                type: "viewVoucher",
                for: voucher.voucher_for,
                id: voucher._id,
                vehicleNo: voucher.vehicle_no,
                voucherNo: voucher.voucher_no,
                date: voucher.date,
                month: voucher.for_month,
                particulars: voucher.particulars,
                rent: voucher.total_rent,
                bills: voucher.total_bills,
                received: voucher.cash_received,
                status: voucher.status,
            };

            res.redirect("/vehicle-list");
        } catch (error) {
            console.error("Error viewing rent info:", error);
            req.session.message = {
                type: "danger",
                message: `Transaction cannot be viewed. Error: ${error.message}`,
            };
            res.redirect("/");
        }
    },


    returnVehicle: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const id = req.params.id;
            const foundVoucher = await Voucher.findById(id);

            if (!foundVoucher) {
                req.session.message = { type: "danger", message: "Voucher not found!" };
                return res.redirect("/vehicle-list");
            }

            res.render("return-vehicle", {
                title: "Return Vehicle",
                VoucherFound: foundVoucher,
                nav: { title: "Accounts", child: "Vehicle", view: 2 },
            });

        } catch (error) {
            console.error("Error retrieving vehicle return data:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },


    returnSave: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const { id } = req.params;
            const { totalRent1, totalBills, cashReceived, status, vehicleID, vehicleNo, vouNo } = req.body;

            // Update Voucher
            const result = await Voucher.findByIdAndUpdate(
                id,
                { total_rent: totalRent1, total_bills: totalBills, cash_received: cashReceived, status: +status },
                { new: true }
            );

            if (!result) {
                req.session.message = { type: "danger", message: "Voucher update failed!" };
                return res.redirect("/vehicle-list");
            }

            // Update Vehicle
            const updatedVehicle = await Vehicles.findByIdAndUpdate(
                vehicleID,
                { $unset: { rented_info: [] }, status: "Available" },
                { new: true }
            );

            if (!updatedVehicle) {
                req.session.message = { type: "danger", message: "Vehicle update failed!" };
                return res.redirect("/vehicle-list");
            }

            // Success Message
            req.session.message = {
                type: "transac",
                tType: "return",
                message: `Voucher for vehicle no. ${vehicleNo} has been successfully returned. Voucher No: ${vouNo} Total Amount: QAR ${totalRent1}`,
            };

            res.redirect("/vehicle-list");

        } catch (error) {
            console.error("Error returning vehicle:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },


    dlAttachment: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");

        try {
            const { filename } = req.params;

            // Set response headers
            res.attachment(filename);

            // Fetch file stream from S3
            const fileStream = await s3Download(filename, "vehicle");

            if (!fileStream) {
                return res.status(404).json({ message: "File not found!" });
            }

            // Pipe file stream to response
            fileStream.pipe(res);

        } catch (error) {
            console.error("Error downloading attachment:", error);
            res.status(500).json({ message: "Error downloading file", error: error.message });
        }
    },



}