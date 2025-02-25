const Company = require('../models/Company');
const Voucher = require('../models/Voucher');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');
const Notif = require('../middleware/notif.middleware');

module.exports = {

  viewDashboard: async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
    try {
      const foundInv = await Invoice.find().sort({ createdAt: -1 }).lean();
      const vehicleFound = await Vehicles.find();
      const vouFound = await Voucher.find();
      
      const [dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
        Notif.getINV(),
        Notif.getVehicle(),
        Notif.getVehicleIn(),
        Notif.getEmployee()
      ]);

      let nav = {
        title: "Dashboard",
        view: 2,
        notif: {
          exIstimara: dataVehicle,
          exInsurance: dataVehicleIn,
          expenPending: dataINV,
          exQID: dataEmployee
        }
      };
      
      res.render('index', {
        title: "AL KATHIRI GROUPS ACCOUNTING",
        nav,
        vehicleFound,
        vouFound,
        invItems: foundInv
      });
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  },

  ownerDashboard: async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
    try {
      const foundInv = await Invoice.find().sort({ createdAt: -1 }).lean();
      const vehicleFound = await Vehicles.find();
      const CompanyFound = await Company.find();
      const vouFound = await Voucher.find();
      
      const [dataINV, dataVehicle, dataVehicleIn, dataEmployee] = await Promise.all([
        Notif.getINV(),
        Notif.getVehicle(),
        Notif.getVehicleIn(),
        Notif.getEmployee()
      ]);

      let nav = {
        title: "Dashboard",
        view: 1,
        notif: {
          exIstimara: dataVehicle,
          exInsurance: dataVehicleIn,
          expenPending: dataINV,
          exQID: dataEmployee
        }
      };

      res.render('owner-dashboard', {
        title: "Datu Trading & Facility Management",
        nav,
        CompanyFound,
        vehicleFound,
        vouFound,
        invItems: foundInv
      });
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  },
  
  companyDashboard: async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/sign-in");
    
    try {
      const companyId = req.params.id;
      const foundCompany = await Company.findById(companyId);
      
      if (!foundCompany) throw new Error("Company not found");
      
      req.session.user = {
        userName: req.user.name,
        userPosition: req.user.position,
        role: req.user.role,
        company: foundCompany.legal_name,
        companyID: foundCompany._id
      };

      res.redirect('/');
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  }
};
