let PaymentVoucher = require('../models/PaymentVoucher');
const CostCenter = require('../models/CostCenter');
const SupplierAccount = require('../models/SupplierAccount');

module.exports = {
  
    viewDashboard: async (req, res)=>{
     if (req.isAuthenticated()){

      PaymentVoucher.find().sort({ created_at: -1 }).lean().exec((err, foundItem) => {
         if (err) {
           res.json({ message: err.message, type: 'danger' });
         } else {

           CostCenter.aggregate([
             {
               "$lookup": {
                 "from": "bill_items",
                 "localField": "cost_center",
                 "foreignField": "cost_center",
                 "as": "bill_items"
               }
             },

             {
               "$project": {
                 "cost_center": 1,
                 "date": "$bill_items.inv_date",
                 "total": "$bill_items.sub_total",
                 "subTotal": {
                   "$sum": "$bill_items.sub_total"
                 },
               }
             },
             { "$sort": { "subTotal": -1 } }
           ], function (errCc, foundcC) {
             if (errCc) {
               res.json({ message: errCc.message, type: 'danger' });
             } else {

               SupplierAccount.find((errbill, suppFound) => {
                 if (err) {
                   res.json({ message: errbill.message, type: 'danger' });
                 } else {

                   SupplierAccount.find({ created_bills: { $gte: 1 } }, (errpay, suppPay) => {
                     if (errpay) {
                       res.json({ message: errpay.message, type: 'danger' });
                     } else {

                       let nav = {
                         title: "Dashboard",
                       };

                       res.render('index', {
                         title: "EL - Accounting - Dashboard",
                         nav: nav,
                         suppPay: suppPay,
                         suppFound: suppFound,
                         foundcC: foundcC,
                         voucherItems: foundItem
                       });

                     }
                   });
                 }
               });
             }
           });

         }

       });
  
        }else{
            res.redirect("/sign-in");
        }
    
    }
}