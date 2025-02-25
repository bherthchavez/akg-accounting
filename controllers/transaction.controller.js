const Voucher = require('../models/Voucher');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');
const Settings = require('../models/Settings');
const ExpensesType = require('../models/ExpensesType');

const Notif = require('../middleware/notif.middleware');

module.exports = {

    createVoucher: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { id } = req.params;
    
            // Fetch active vehicles and voucher settings
            const [foundVehicles, voucherSetting, dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
                Vehicles.find({ status: 1 }),
                Settings.findOne({ name: "voucher_settings" }),
                Notif.getINV(),
                Notif.getVehicle(),
                Notif.getVehicleIn(),
                Notif.getEmployee()
            ]);
    
            if (!voucherSetting) {
                return res.json({ message: "Voucher settings not found.", type: "danger" });
            }
    
            let vouNo = voucherSetting.prefix + voucherSetting.starting_no;
    
            let nav = {
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
    
            let vehicleNo = "others";
    
            if (id !== "others") {
                const vehicle = await Vehicles.findById(id);
                if (!vehicle) {
                    return res.json({ message: "Vehicle not found.", type: "danger" });
                }
                vehicleNo = vehicle.vehicle_no;
            }
    
            res.render("create-voucher", {
                title: "Create Voucher",
                nav,
                vouNo,
                foundVehicles,
                vehicleNo
            });
    
        } catch (error) {
            console.error("Error creating voucher:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },
    

    saveVoucher: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { voucherFor, vouNo, date, forMonth, particulars, totalRent, totalBills } = req.body;
    
            const formattedTotalRent = +totalRent.replace(/,/g, "");
            const formattedTotalBills = +totalBills.replace(/,/g, "");
            const totalReceived = formattedTotalRent - formattedTotalBills;
    
            let vehicleData = { vehicle_id: null, vehicle_no: null };
    
            if (voucherFor !== "Others") {
                const foundVehicle = await Vehicles.findById(voucherFor);
                if (!foundVehicle) throw new Error("Vehicle not found");
    
                vehicleData = {
                    vehicle_id: foundVehicle._id,
                    vehicle_no: foundVehicle.vehicle_no
                };
            }
    
            const voucher = new Voucher({
                voucher_no: vouNo,
                voucher_for: voucherFor,
                vehicle_id: vehicleData.vehicle_id,
                vehicle_no: vehicleData.vehicle_no,
                date,
                for_month: forMonth,
                particulars,
                total_rent: formattedTotalRent,
                total_bills: formattedTotalBills,
                cash_received: totalReceived,
                status: 2,
                vehicle_status: voucherFor !== "Others" ? 2 : undefined,
                company_id: req.user.company_id,
                created_by: req.user.name
            });
    
            const savedVoucher = await voucher.save();
    
            // Update voucher settings and vehicle income in parallel
            await Promise.all([
                Settings.findOneAndUpdate(
                    { name: "voucher_settings" },
                    { $inc: { starting_no: 1 } }
                ),
                voucherFor !== "Others"
                    ? Vehicles.findByIdAndUpdate(vehicleData.vehicle_id, {
                          $inc: { income: formattedTotalRent },
                          $set: { status: 2, voucher_id: savedVoucher._id }
                      })
                    : Promise.resolve()
            ]);
    
            req.session.message = {
                type: "transac",
                tType: voucherFor !== "Others" ? "voucherV" : "voucher",
                message: `Voucher ${
                    voucherFor !== "Others" ? `for vehicle no. ${vehicleData.vehicle_no}` : ""
                } has been successfully created. Voucher No: ${vouNo} Total Amount: QAR ${totalReceived.toLocaleString()}`,
                transID: savedVoucher._id
            };
    
            res.redirect(voucherFor !== "Others" ? "/vehicle-list" : "/");
        } catch (error) {
            console.error("Error saving voucher:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },
    

    viewVoucher: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { id } = req.params;
    
            // Fetch voucher by ID
            const result = await Voucher.findById(id);
    
            if (!result) {
                req.session.message = {
                    type: "danger",
                    message: "Transaction cannot be viewed. Error: Voucher not found.",
                };
                return res.redirect("/");
            }
    
            // Store voucher details in session
            req.session.message = {
                type: "viewVoucher",
                for: result.voucher_for,
                id: result._id,
                vehicleNo: result.vehicle_no,
                voucherNo: result.voucher_no,
                date: result.date,
                month: result.for_month,
                particulars: result.particulars,
                rent: result.total_rent,
                bills: result.total_bills,
                received: result.cash_received,
                status: result.status,
                vehicleStatus: result.vehicle_status,
            };
    
            res.redirect("/");
    
        } catch (error) {
            console.error("Error viewing voucher:", error);
            req.session.message = {
                type: "danger",
                message: "Transaction cannot be viewed. Error: " + error.message,
            };
            res.redirect("/");
        }
    },
    

    saveUpdateVou: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { id } = req.params;
            const {
                totalRent,
                totalBills,
                cashReceived,
                status,
                vehicleStatus,
                vehicleNo,
                vouNo,
            } = req.body;
    
            const resultVoucher = await Voucher.findById(id);
            if (!resultVoucher) {
                req.session.message = {
                    type: "danger",
                    message: "Transaction cannot be viewed. Error: Voucher not found.",
                };
                return res.redirect("/");
            }
    
            // Updating the Voucher
            const updateData = {
                total_rent: totalRent,
                total_bills: totalBills,
                cash_received: cashReceived,
                status: Number(status),
            };
    
            if (resultVoucher.voucher_for !== "Others") {
                updateData.vehicle_status = Number(vehicleStatus);
            }
    
            const updatedVoucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true });
    
            if (!updatedVoucher) {
                req.session.message = {
                    type: "danger",
                    message: "Failed to update voucher.",
                };
                return res.redirect("/");
            }
    
            // If vehicle status is set to "1" (returning the vehicle), update the vehicle status
            if (resultVoucher.voucher_for !== "Others" && parseInt(vehicleStatus) === 1) {
                await Vehicles.findByIdAndUpdate(resultVoucher.vehicle_id, {
                    status: 1,
                    voucher_id: "",
                });
            }
    
            // Success message
            req.session.message = {
                type: "transac",
                tType: "voucherU",
                message: `Voucher ${resultVoucher.voucher_for !== "Others" ? `for vehicle no. ${vehicleNo}` : ""} has been successfully updated. Voucher No: ${vouNo} Total Amount: QAR ${totalRent}`,
                transID: updatedVoucher._id,
            };
    
            res.redirect(resultVoucher.voucher_for !== "Others" ? "/vehicle-list" : "/");
        } catch (error) {
            console.error("Error updating voucher:", error);
            req.session.message = {
                type: "danger",
                message: `Transaction cannot be updated. Error: ${error.message}`,
            };
            res.redirect("/");
        }
    },
    

    updateVoucher: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { id } = req.params;
    
            // Fetch voucher by ID
            const foundVoucher = await Voucher.findOne({ _id: id });
            if (!foundVoucher) return res.json({ message: "Voucher not found", type: "danger" });
    
            // Fetch notifications concurrently
            const [dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
                Notif.getINV(),
                Notif.getVehicle(),
                Notif.getVehicleIn(),
                Notif.getEmployee()
            ]);
    
            // Create navigation object
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
    
            // Render update voucher page
            res.render("update-voucher", {
                title: "Update Voucher",
                VoucherFound: foundVoucher,
                nav
            });
    
        } catch (error) {
            console.error("Error updating voucher:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },
    

    createInvoice: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { id } = req.params;
    
            // Fetch all required data concurrently
            const [foundVehicles, foundExpensesType, voucherSetting, dataINV, dataVehicle, dataVehicleIn, dataEmployee] =
                await Promise.all([
                    Vehicles.find(),
                    ExpensesType.find(),
                    Settings.findOne({ name: "invoice_settings" }),
                    Notif.getINV(),
                    Notif.getVehicle(),
                    Notif.getVehicleIn(),
                    Notif.getEmployee()
                ]);
    
            if (!voucherSetting) {
                return res.json({ message: "Invoice settings not found", type: "danger" });
            }
    
            // Generate invoice number
            const vouNo = `${voucherSetting.prefix}${voucherSetting.starting_no}`;
    
            // Create navigation object
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
    
            // Check if vehicle ID is not 'others', fetch specific vehicle data
            let vehicleNo = "others";
            if (id !== "others") {
                const result = await Vehicles.findById(id);
                if (!result) return res.json({ message: "Vehicle not found", type: "danger" });
                vehicleNo = result.vehicle_no;
            }
    
            // Render the invoice creation page
            res.render("create-invoice", {
                title: "Create Invoice",
                nav,
                vouNo,
                foundVehicles,
                vehicleNo,
                foundExpensesType
            });
    
        } catch (error) {
            console.error("Error creating invoice:", error);
            res.json({ message: error.message, type: "danger" });
        }
    },
    

    saveInvoice: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { 
                invNo, 
                expensesFor, 
                vehicleID, 
                invDate, 
                date, 
                payee, 
                expenseType, 
                description, 
                paymentType, 
                cardDetails, 
                forMonth, 
                remarks, 
                amount: rawAmount 
            } = req.body;
    
            const amount = +(rawAmount.split(',').join(''));
    
            let vId = "Others";
            let vNo = "Others";
    
            if (expensesFor === "vehicle") {
                const foundVehicle = await Vehicles.findById(vehicleID);
                if (!foundVehicle) {
                    req.session.message = { type: "danger", message: "Vehicle not found." };
                    return res.redirect("/vehicle-list");
                }
                vId = vehicleID;
                vNo = foundVehicle.vehicle_no;
            }
    
            const cDetails = paymentType === "card" ? cardDetails : "cash";
            const expenSet = await Settings.findOne({ name: "expenses_settings" });
            const setStatus = amount >= expenSet.value ? 2 : 1;
    
            const invoice = new Invoice({
                inv_no: invNo,
                expenses_for: expensesFor,
                vehicle_id: vId,
                vehicle_no: vNo,
                inv_date: invDate,
                date: date,
                payee: payee,
                expenses_type: expenseType,
                description: description,
                payment_type: paymentType,
                card_details: cDetails,
                month: forMonth,
                remarks: remarks,
                amount: amount,
                status: setStatus,
                company_id: req.user.company_id,
                created_by: req.user.name,
            });
    
            const savedInvoice = await invoice.save();
    
            if (expensesFor === "vehicle") {
                const foundVehicle = await Vehicles.findById(vehicleID);
                const totalExpenses = (foundVehicle?.expenses || 0) + amount;
                await Vehicles.findByIdAndUpdate(vehicleID, { expenses: totalExpenses });
            }
    
            const invSetting = await Settings.findOne({ name: "invoice_settings" });
            await Settings.findOneAndUpdate({ name: "invoice_settings" }, { $set: { starting_no: parseFloat(invSetting.starting_no) + 1 } });
    
            const notifMsg = expensesFor === "vehicle" ? `Invoice for vehicle: ${vNo}` : "Invoice";
            req.session.message = {
                type: "transac",
                tType: "invoice",
                message: `${notifMsg} has been successfully created. Invoice No: ${savedInvoice.inv_no} Total Amount: QAR ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`,
                transID: savedInvoice._id,
            };
    
            res.redirect(expensesFor === "vehicle" ? "/vehicle-list" : "/");
        } catch (error) {
            console.error("Error saving invoice:", error);
            req.session.message = { type: "danger", message: `Transaction cannot be saved. Error: ${error.message}` };
            res.redirect("/");
        }
    },

    viewInvoice: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const { id } = req.params;
    
            // Fetch invoice by ID
            const result = await Invoice.findById(id);
    
            if (!result) {
                req.session.message = {
                    type: "danger",
                    message: "Transaction cannot be viewed. Error: Invoice not found.",
                };
                return res.redirect("/");
            }
    
            // Store invoice details in session
            req.session.message = {
                type: "viewInvoice",
                invNo: result.inv_no,
                for: result.expenses_for,
                id: result._id,
                vehicleNo: result.vehicle_no,
                date: result.date,
                payee: result.payee,
                expensesType: result.expenses_type,
                description: result.description,
                paymentType: result.payment_type,
                month: result.month,
                remarks: result.remarks,
                amount: result.amount,
                status: result.status,
                reason: result.approval_rsn,
                createdBy: result.created_by,
            };
    
            res.redirect("/");
    
        } catch (error) {
            console.error("Error viewing invoice:", error);
            req.session.message = {
                type: "danger",
                message: "Transaction cannot be viewed. Error: " + error.message,
            };
            res.redirect("/");
        }
    },
    

    updateInvoice: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const id = req.params.id;
            const foundInv = await Invoice.findById(id);
            if (!foundInv) {
                return res.json({ message: "Invoice not found." });
            }
    
            // Fetch notifications concurrently
            const [dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
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
    
            res.render("update-invoice", {
                title: "Update Voucher",
                foundInv,
                nav
            });
    
        } catch (error) {
            console.error("Error fetching invoice:", error);
            res.json({ message: `Error fetching invoice: ${error.message}` });
        }
    },

    saveUpdateInv: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        try {
            const id = req.params.id;
            const amount = parseFloat(req.body.amount.replace(/,/g, ""));
            const cDetails = req.body.paymentType === "Card" ? req.body.cardDetails : "Cash";
    
            const expenSet = await Settings.findOne({ name: "expenses_settings" });
            if (!expenSet) throw new Error("Expense settings not found");
    
            const setStatus = amount >= expenSet.value ? 2 : 1;
            const resultInvoice = await Invoice.findById(id);
            if (!resultInvoice) throw new Error("Invoice not found");
    
            const updateData = {
                inv_date: req.body.invDate,
                date: req.body.date,
                payee: req.body.payee,
                expenses_type: req.body.expenseType,
                description: req.body.description,
                payment_type: req.body.paymentType,
                card_details: cDetails,
                month: req.body.forMonth,
                remarks: req.body.remarks,
                status: setStatus,
                amount: amount,
                updated_by: req.user.name,
            };
    
            const result = await Invoice.findByIdAndUpdate(id, updateData, { new: true });
            if (!result) throw new Error("Failed to update invoice");
    
            // If the invoice is related to a vehicle, update vehicle expenses
            if (resultInvoice.expenses_for !== "Others") {
                const resulVehicle = await Vehicles.findOne({ vehicle_no: req.body.vehicleID });
                if (!resulVehicle) throw new Error("Vehicle not found");
    
                const totalEx = resulVehicle.expenses - resultInvoice.amount + amount;
                await Vehicles.findOneAndUpdate({ vehicle_no: req.body.vehicleID }, { expenses: totalEx });
            }
    
            req.session.message = {
                type: "transac",
                tType: "invUpdate",
                message: `Invoice for vehicle no. ${result.vehicle_no} has been successfully updated. Invoice No: ${result.inv_no} Total Amount: QAR ${amount}`,
                transID: result._id,
            };
    
            res.redirect(resultInvoice.expenses_for !== "Others" ? "/vehicle-list" : "/");
    
        } catch (error) {
            console.error("Error updating invoice:", error);
            req.session.message = {
                type: "danger",
                message: `Transaction cannot be saved. Error: ${error.message}`,
            };
            res.redirect("/");
        }
    },
    

    viewPendingINV: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        if (req.user.role !== 1) return res.redirect("/");
    
        try {
            const resultINV = await Invoice.find({ status: 2 });
            if (!resultINV) throw new Error("No pending expenses found.");
    
            // Fetch all notifications in parallel
            const [dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
                Notif.getINV(),
                Notif.getVehicle(),
                Notif.getVehicleIn(),
                Notif.getEmployee(),
            ]);
    
            const nav = {
                title: "Notifications",
                child: "Pending Expenses",
                view: 2,
                notif: {
                    exIstimara: dataVehicle,
                    exInsurance: dataVehicleIn,
                    expenPending: dataINV,
                    exQID: dataEmployee,
                },
            };
    
            res.render("pending-expenses", {
                title: "Expenses Approval List",
                nav: nav,
                pendingINV: resultINV,
            });
    
        } catch (error) {
            console.error("Error fetching pending invoices:", error);
            req.session.message = {
                type: "danger",
                message: `Pending expenses cannot be viewed. Error: ${error.message}`,
            };
            res.redirect("/");
        }
    },
    

    saveApprovalInv: async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
        if (req.user.role !== 1) return res.redirect("/");
    
        try {
            const id = req.params.id;
            const status = +req.body.ans;
            const reasonApproval = req.body.reason_approval;
    
            const updatedInvoice = await Invoice.findByIdAndUpdate(
                id,
                {
                    status: status,
                    approval_rsn: reasonApproval,
                    updated_by: req.user.name,
                },
                { new: true } // Returns the updated document
            );
    
            if (!updatedInvoice) throw new Error("Invoice not found");
    
            req.session.message = {
                type: status === 1 ? "success" : "warning",
                message: `Invoice ${updatedInvoice.inv_no} ${status === 1 ? "approved" : "rejected"}!`,
            };
    
            res.redirect("/pending-expenses");
    
        } catch (error) {
            console.error("Error updating invoice:", error);
            req.session.message = {
                type: "danger",
                message: `Transaction cannot save. Error: ${error.message}`,
            };
            res.redirect("/");
        }
    },
    

}