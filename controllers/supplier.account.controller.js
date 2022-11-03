
const SupplierAccount = require('../models/SupplierAccount');

module.exports = {

    addSuppAcc : async (req, res) =>{
        if (req.isAuthenticated()){

                const openingBalance = + (req.body.openingBalance).split(',').join('');;

                const sAcc = new SupplierAccount({
                    supplier_name: req.body.supplierName,
                    a_name: req.body.arabicName,
                    contact_person: req.body.contactPerson,
                    email: req.body.supplierEmail,
                    address: req.body.address,
                    opening_balance: openingBalance,
                    beneficiary_name: req.body.bName,
                    beneficiary_address: req.body.bAddress,
                    bank_name: req.body.bBankName,
                    iban_no: req.body.ibanNo,
                    swift_code: req.body.swiftCode,
                    billed: 0,
                    paid: 0,
                    balance_amount: 0,
                    active_status: parseInt(req.body.status),
                    created_bills: 0,
                    created_by: req.user.name,
                    updated_at: Date.now()
                });
                sAcc.save((err)=>{
                    if(err){
                        res.json({message: err.message, type: 'danger'});
                    }else{
                        req.session.message = {
                            type: 'success',
                            message: 'Supplier account added successfully!',
                        };
                        res.redirect('/supplier-accounts');
                    }
                });

        }else{
            res.redirect("/sign-in");
        }
    },

    viewSuppAcc: async (req, res)=>{
        if (req.isAuthenticated()){

            SupplierAccount.find().exec((err, accounts)=>{
                    if(err){
                        res.json({message: err.message});
                    }else{

                        let nav = {
                            title: "Accounts",
                            child: "Suppliers"
                        };
                    
                        res.render('supplier-accounts', {
                            title: "Supplier Accounts",
                            supplierAccount: accounts,
                            nav: nav
                        })
                    }
                });

        }else{
            res.redirect("/sign-in");
        }   

    },

    updateSuppAcc: async (req, res)=>{
        if (req.isAuthenticated()){

            let id = req.params.id;

            const balanceAmount = + (req.body.openingBalance).split(',').join('');

            SupplierAccount.findByIdAndUpdate(id, {
                supplier_name:  req.body.supplierName,
                a_name:  req.body.arabicName,
                contact_person: req.body.contactPerson, 
                email:  req.body.email,
                address: req.body.address,
                opening_balance: balanceAmount,
                beneficiary_name: req.body.bName,
                beneficiary_address: req.body.bAddress,
                bank_name: req.body.bBankName,
                iban_no: req.body.ibanNo,
                swift_code: req.body.swiftCode,
                active_status: parseInt(req.body.status),
                updated_at: Date.now()
            }, (err, result)=>{
                if(err){
                    res.json({message: err.message, type: 'danger'});
                }else{
                    req.session.message = {
                        type: 'success',
                        message: 'Supplier account updated successfully!'
                    };
                
                    res.redirect('/supplier-accounts')
                }
            });

        }else{
            res.redirect("/sign-in");
        } 
    },

    deleteSuppAcc : async (req, res)=>{
        if (req.isAuthenticated()){

            let id = req.params.id

            SupplierAccount.findById(id, (err, result)=>{
                if(err){
                    res.json({message: err.message});
                }else{

                    if (result.billed === 0 && result.paid === 0){

                        SupplierAccount.findByIdAndRemove(id, (err)=>{
                            
                            if(err){
                                res.json({message: err.message});
                            }else{
                                req.session.message = {
                                    type: 'info',
                                    message: 'Supplier account deleted successfully!',
                                };
                                res.redirect('/supplier-accounts')
                            }

                        });

                    }else{

                        req.session.message = {
                            type: 'danger',
                            message: result.supplier_name + ': cannot not be deleted since it has one or more entries and still present!',
                        };
                        res.redirect('/supplier-accounts')

                    }

                    }

            });

        }else{
            res.redirect("/sign-in");
        } 
    }

}