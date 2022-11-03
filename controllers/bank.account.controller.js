const BankAccount = require('../models/BankAccount');

module.exports = {

    addBankAcc : async (req, res) =>{
        if (req.isAuthenticated()){

                const balanceAmount = + (req.body.openingBalance).split(',').join('');

                const bAcc = new BankAccount({
                    bank_name: req.body.bankName,
                    account_name: req.body.ownerName,
                    account_number: req.body.accountNumber,
                    account_type: req.body.accountType,
                    bank_email: req.body.bankEmail,
                    deposited: balanceAmount,
                    withdrawal: 0,
                    balance_amount: balanceAmount,
                    created_by: req.user.name,
                    updated_at: Date.now()
                });
                bAcc.save((err)=>{
                    if(err){
                        res.json({message: err.message, type: 'danger'});
                    }else{
                        req.session.message = {
                            type: 'success',
                            message: 'Bank account added successfully!',
                        };
                        res.redirect('/bank-accounts');
                    }
                });

        }else{
            res.redirect("/sign-in");
        }
    },

    viewBankAcc: async (req, res)=>{
        if (req.isAuthenticated()){

                BankAccount.find().exec((err, accounts)=>{
                    if(err){
                        res.json({message: err.message});
                    }else{
                        let nav = {
                            title: "Accounts",
                            child: "Bank",
                        };
                    
                        res.render('bank-accounts', {
                            title: "Bank Accounts",
                            bankAccount: accounts,
                            nav: nav
                        })
                    }
                });

        }else{
            res.redirect("/sign-in");
        }   

    },

    updateBankAcc: async (req, res)=>{

         let id = req.params.id;
         

         BankAccount.findByIdAndUpdate(id, {
            bank_name:  req.body.bankName,
            account_name:  req.body.ownerName,
            account_number: req.body.accountNumber, 
            account_type:  req.body.accountType,
            bank_email: req.body.bankEmail,
            updated_at: Date.now()
         }, (err, result)=>{
            if(err){
                res.json({message: err.message, type: 'danger'});
            }else{
                req.session.message = {
                    type: 'success',
                    message: 'Bank account updated successfully!'
                };
               
                res.redirect('/bank-accounts')
            }
         });
    },

    deleteBankAcc : async (req, res)=>{
        let id = req.params.id

        BankAccount.findById(id, (err, result)=>{
            if(err){
                res.json({message: err.message});
            }else{

                if (result.withdrawal === 0){

                    BankAccount.findByIdAndRemove(id, (err)=>{
                        
                        if(err){
                            res.json({message: err.message});
                        }else{
                            
                            req.session.message = {
                                type: 'info',
                                message: 'Bank account deleted successfully!',
                            };
                            res.redirect('/bank-accounts')
                        }

                    });

                }else{

                    req.session.message = {
                        type: 'danger',
                        message: result.bank_name + ': cannot not be deleted since it has one or more entries and still present!',
                    };
                    res.redirect('/bank-accounts')


                }
            }
         });
    }
}