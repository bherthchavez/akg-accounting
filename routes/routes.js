const router = require('express').Router();
const dashboard = require('../controllers/dashboard.controller');
const settings = require('../controllers/settings.controller');
const setup = require('../controllers/setup.controller');
const bankAccController = require('../controllers/bank.account.controller');
const vehiclesController = require('../controllers/vehicle.controller');
const transactionController = require('../controllers/transaction.controller');
const user = require('../controllers/user.auth.controller');
const upload = require('../middleware/upload.middleware')


router.get('/', dashboard.viewDashboard);
router.get('/owner-dashboard', dashboard.ownerDashboard);
router.get('/company-dashboard/:id', dashboard.companyDashboard);
router.get('/sign-in', user.signIn);
router.post('/sign-in', user.checkUser);
router.get('/logout', user.logoutUser);

router.get('/company-setup', setup.companySetup);
router.post('/add-company', setup.addCompany);
router.post('/update-company/:id', setup.updateCompany);
router.get('/delete-company/:id', setup.deleteCompany);

router.get('/register', setup.devRegister); //for development
router.post('/add-userDev', setup.addUserDev);  //for development


router.get('/user-setup', setup.userSetup);
router.post('/add-user', setup.addUser);
router.post('/update-user/:id', setup.updateUser);
router.post('/change-password', setup.changePassUser);

router.get('/hima-the-hokage', settings.viewHima);
router.get('/download-attachment/:filename', settings.downloadHima);
router.get('/delete-attachment/:filename', settings.deleteHima);

router.get('/system-settings', settings.viewSysSettings);
router.post('/update-system-settings', settings.updateSysSettings);


router.get('/master', settings.viewChartAcc);
router.post('/add/account-ledger', settings.addChartAcc );
router.post('/update/ledger/:id', settings.updateChartAcc)
router.get('/delete/ledger/:id', settings.deleteChartAcc);

router.get('/cost-center', settings.viewCostCenter);
router.post('/add/cost-center', settings.addCostCenter );
router.post('/update/cost-center/:id', settings.updateCostCenter)
router.get('/delete/cost-center/:id', settings.deleteCostCenter);

router.get('/purpose-transfer', settings.viewPurpose);
router.post('/add/purpose-transfer', settings.addPurpose );
router.post('/update/purpose/:id', settings.updatePurpose)
router.get('/delete/purpose/:id', settings.deletePurpose);

router.get('/bank-accounts', bankAccController.viewBankAcc);
router.post('/add/bank-accounts/', bankAccController.addBankAcc );
router.post('/update/bank-accounts/:id', bankAccController.updateBankAcc)
router.get('/delete/bank-account/:id', bankAccController.deleteBankAcc);

router.get('/vehicle-list', vehiclesController.viewVehicles);
router.post('/add/vehicle', vehiclesController.addVehicle );
router.post('/update/vehicle/:id', vehiclesController.updateVehicles)
router.get('/delete/vehicle/:id', vehiclesController.deleteVehicle);

router.get('/create-voucher/:id', transactionController.createVoucher); 
router.post('/transaction-voucher', transactionController.saveVoucher);
router.get('/view-voucher/:id', transactionController.viewVoucher);
router.get('/update-voucher/:id', transactionController.updateVoucher);
router.post('/save/update-voucher/:id', transactionController.saveUpdate);

router.get('/create-invoice/:id', transactionController.createInvoice);
router.post('/transaction-invoice', transactionController.saveInvoice);
router.get('/view-invoice/:id', transactionController.viewInvoice);
router.get('/update-invoice/:id', transactionController.updateInvoice);
router.post('/save/update-invoice/:id', transactionController.saveUpdate);

router.get('/rent-info/:id', vehiclesController.viewRentInfo);
router.get('/return/:id', vehiclesController.returnVehicle);
router.post('/return-vehicle/:id', vehiclesController.returnSave);


router.all('*', settings.err404);
module.exports = router;