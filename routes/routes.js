const router = require('express').Router();
const dashboard = require('../controllers/dashboard.controller');
const settings = require('../controllers/settings.controller');
const bankAccController = require('../controllers/bank.account.controller');
const vehiclesController = require('../controllers/vehicle.list.controller');
const transactionController = require('../controllers/transaction.controller');
const user = require('../controllers/user.auth.controller');
const upload = require('../middleware/upload.middleware')


router.get('/', dashboard.viewDashboard);
router.get('/sign-in', user.signIn);
router.post('/sign-in', user.checkUser);
router.get('/logout', user.logoutUser);
router.get('/user-register', user.registerUser);
router.post('/register', user.register);
router.get('/change-pass', user.changePass);


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

router.get('/create-invoice/:id', transactionController.createInvoice);
router.post('/transaction-invoice', transactionController.saveInvoice);


router.get('/rent-info/:id', vehiclesController.viewRentInfo);
router.get('/return/:id', vehiclesController.returnVehicle);
router.post('/return-vehicle/:id', vehiclesController.returnSave);
// router.get('/print-voucher/:id', transactionController.printVoucher);


router.all('*', settings.err404);
module.exports = router;