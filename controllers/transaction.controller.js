const BankAccount = require('../models/BankAccount');
const SupplierAccount = require('../models/SupplierAccount');
const SupplierBill = require('../models/Supplier-Bill');
const BillItem = require('../models/BillItem');
const ChartOfAccount = require('../models/ChartOfAccount');
const CostCenter = require('../models/CostCenter');
const PurposeTransfer = require('../models/PurposeTransfer');
const Settings = require('../models/Settings');
const PaymentVoucher = require('../models/PaymentVoucher');

const AmountToWords = require('../middleware/amount-words.middleware');

module.exports = {

    printLetter : async (req, res)=>{
    
        if (req.isAuthenticated()){

          let id = req.params.id;

          PaymentVoucher.findById(id, (err, foundItem)=>{
    
              if(err){
                res.json({message: err.message, type: 'danger'});
              }else{
                let nav = {
                  title: "Dashboard",
                 };
              

                res.render('print-bank-letter', {title: "Print Bank Letter",
                  nav:nav,
                  foundItems: foundItem.bank_transfer
                  });
              } 
            });

        }else{
            res.redirect("/sign-in");
        } 
    },

    printVoucher : async (req, res)=>{
      if (req.isAuthenticated()){

        let id = req.params.id;

        PaymentVoucher.findById(id, (err, foundVoucher)=>{
          if(err){
            res.json({message: err.message, type: 'danger'});
            }else{

              SupplierBill.find({bill_number: { $in: foundVoucher.selected_bill_no}}, (err, foundBills)=>{
                if(err){

                  res.json({message: err.message, type: 'danger'});
                
                 }else{

                  let nav = {
                    title: "Dashboard",
                   };

                  res.render('print-payment-voucher', {title: "Print Payment Voucher",
                    nav:nav,
                    foundBills: foundBills, 
                    foundItems: foundVoucher});

                 }
              }); 

            } 
          
          });
          
        }else{
            res.redirect("/sign-in");
        } 
    },

    cBillSuppAcc : async (req, res)=>{
        if (req.isAuthenticated()){

            let id = req.params.id

            ChartOfAccount.find().exec((err, chartOfAccount)=>{
                if(err){
                    res.json({message: err.message, type: 'danger'});
                }else{
                
                    CostCenter.find().exec((err, costCenter)=>{
                    if (err){
                        res.json({message: err.message, type: 'danger'});
                    }else{

                        SupplierAccount.findById(id, (err, foundItem)=>{
                            if (err){
                                res.json({message: err.message, type: 'danger'});
                            }else{

                                SupplierAccount.find().exec((err, foundSupplier)=>{
                                
                                Settings.findOne({name: "bill_settings"}, (err, billSetting)=>{
                                    if (err) {
                                        res.json({message: err.message, type: 'danger'});
                                    }else{
                                    let puvno = billSetting.prefix + billSetting.starting_no;
                                    let nav = {
                                        title: "Accounts",
                                        child: "Suppliers"
                                    };

                                    res.render('create-purchase-bill', {title: "Create Supplier Bill",
                                        nav: nav,
                                        foundSupplier:foundSupplier, 
                                        puvno: puvno, 
                                        chartAccounts: chartOfAccount, 
                                        costCenter: costCenter,
                                        accountID:foundItem._id,
                                        supplierName: foundItem.supplier_name, 
                                        aName: foundItem.a_name, 
                                       
                                         });
                                    }
                                
                                });
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
    },

    supplierBill : async (req, res)=>{
        if (req.isAuthenticated()){

            SupplierAccount.findOne({_id:req.body.supplierID}, (err, foundSupplier)=>{
              if(err){
                res.json({message: err.message, type: 'danger'});
              }else{
                const totalPayment = + (req.body.totalPayment).split(',').join('');
                const bill = new SupplierBill({
                  supplier_id:  req.body.supplierID,
                  supplier_name: foundSupplier.supplier_name,
                  bill_number: req.body.puvNo,
                  bill_date:  req.body.date,
                  documents:  req.file.filename,
                  description:  req.body.description,
                  total_payment: totalPayment,
                  total_items: req.body.numOfItem,
                  status: "Pending",
                  created_by: req.user.name,
                  updated_at: Date.now()
                });
                bill.save( (err, docs)=>{
                  if(err){
                    res.json({message: err.message, type: 'danger'});
                  }else{
                    let totalItem = +  req.body.numOfItem;
                     if (totalItem == 1){
                          let newitem = new BillItem({
                            bill_number:  req.body.puvNo,
                            items:  req.body.item,
                            items_description: req.body.itemDesc,
                            cost_center:  req.body.costCenter,
                            inv_no:  req.body.invNo,
                            inv_date:  req.body.invDate,
                            lpo:  req.body.lpo,
                            items_price: + (req.body.price).split(',').join(''),
                            items_qty: + (req.body.qty).split(',').join(''),
                            sub_total: +(req.body.total).split(',').join(''), 
                            created_by:  req.user.name,
                            updated_at: Date.now()
                          });
                          newitem.save((err, saved)=>{
                            if(err){
                                res.json({message: err.message, type: 'danger'});
                            }
                          });
                     }else{
                      for (var i = 0; i < totalItem; i++){
                        let newitem =  new BillItem ({
                          bill_number:  req.body.puvNo,
                          items:  req.body.item[i],
                          items_description: req.body.itemDesc[i],
                          cost_center:  req.body.costCenter[i],
                          inv_no:  req.body.invNo[i],
                          inv_date:  req.body.invDate[i],
                          lpo:  req.body.lpo[i],
                          items_price: + (req.body.price[i]).split(',').join(''),
                          items_qty: + (req.body.qty[i]).split(',').join(''),
                          sub_total: +(req.body.total[i]).split(',').join(''), 
                          created_by:  req.user.name,
                          updated_at: Date.now()
                        });
                        newitem.save(function(err, saved){
                          if(err){
                            res.json({message: err.message, type: 'danger'});
                          }
                        });
                      }
                     } 
                     let totalBilled = 0;
        
                     SupplierBill.find({supplier_id: req.body.supplierID, status: 'Pending' }, (err, supBills)=>{ 
                     
                            if(err){
                              res.json({message: err.message, type: 'danger'});
                            }else{
                              totalBilled = + foundSupplier.billed;
                              totalBilled += +(req.body.totalPayment).split(',').join('');
                              SupplierAccount.findOneAndUpdate({_id: req.body.supplierID},
                                  {$set: {
                                  billed: totalBilled,
                                  created_bills: supBills.length }}, (err)=>{
                                    if (err){
                                       res.json({message: err.message, type: 'danger'});
                                    }
                              });
                            }
                          });
                          
                        Settings.findOne({name: "bill_settings"}, (err, billSetting)=>{
                        let puvno = parseFloat(billSetting.starting_no) + 1;
                            Settings.findOneAndUpdate({name: "bill_settings"},
                            {$set: {starting_no:  puvno}}, (err,)=>{
                              if (err){
                                res.json({message: err.message, type: 'danger'});
                              }
                             });
                        });  
                  }
                });

                req.session.message = {
                    type: 'transac',
                    tType: 'bill',
                    message: 'Bill for '+ foundSupplier.supplier_name + ' has been successfully created. Bill No: ' + req.body.puvNo +' Amount: QAR '+req.body.totalPayment,
                    transID: req.body.supplierID,
                };

                res.redirect("/supplier-accounts")
              }
            });
        }else{
            res.redirect("/sign-in");
        } 
    },

    paySuppBill : async (req, res)=>{
        if (req.isAuthenticated()){

            let id = req.params.id

            BankAccount.find({}, function(err, foundBAccounts){
            if (err) {
                res.json({message: err.message, type: 'danger'});
            } else {  
                SupplierAccount.findById(id, (err, foundSupp)=>{
                    if (err){
                        res.json({message: err.message, type: 'danger'});
                    }else{
                        SupplierBill.find({supplier_id: foundSupp._id, status: "Pending"}, (err, foundBill)=>{
                        if (err){
                            res.json({message: err.message, type: 'danger'});
                        }else{
                            Settings.findOne({name: "payment_voucher_settings"}, (err, paySetting)=>{
                            if (err) {
                                res.json({message: err.message, type: 'danger'});
                            }else{
        
                                PurposeTransfer.find({},(err, purposeItems)=>{
                                  if(!err){
        
                                    let pavno = paySetting.prefix + paySetting.starting_no;

                                    let nav = {
                                        title: "Accounts",
                                        child: "Suppliers"
                                    };
                            
                                    res.render("pay-supplier-bill", {title: "Pay Supplier Bill",
                                      nav: nav,
                                      purposeItems: purposeItems, 
                                      pavno:pavno, 
                                      bankAccounts: foundBAccounts,
                                      suppBills: foundBill,
                                      accountID:foundSupp._id,
                                      supplierName: foundSupp.supplier_name,
                                      beneficiaryName: foundSupp.beneficiary_name,
                                      aName: foundSupp.a_name, 
                                      userName: req.user.name, 
                                      userRole: req.user.userRole });
        
                                  }
        
                                    
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
    },

    paySupplier : async (req, res)=>{
        if (req.isAuthenticated()){
          
            
            BankAccount.findOne({_id: req.body.paymentFrom,}, (bankerr, foundItem)=>{ 
         
                if (bankerr){
                    res.json({message: bankerr.message, type: 'danger'});
                  }else{
                   
                    const  Bank_Name = foundItem.bank_name;
                    let Bank_Withdrawal = '' + foundItem.withdrawal;
                    let Bank_Deposited = '' + foundItem.deposited;
        
                    
                   const payment_amount = +(req.body.totalPayment).split(',').join('');
                   
                    Bank_Withdrawal = +(Bank_Withdrawal).split(',').join('');
                    Bank_Deposited = +(Bank_Deposited).split(',').join('');
        
        
                    var x =(req.body.totalPayment).split(',').join('');
                        x = parseFloat(x)
                      x = "" + x
                    const totalAmountInWords = AmountToWords.toWords(x);
                   
                    const pay = new PaymentVoucher({
                      payment_voucher_no: req.body.pavNo,
                      supplier_id: req.body.supplierID,
                      supplier_name: req.body.supplierName,
                      payment_from: Bank_Name,
                      bank_id: req.body.paymentFrom,
                      payment_mode: req.body.paymentMode,
                      date: req.body.billDate,
                      description: req.body.description,
                      documents: req.file.filename,
                      total_payment: payment_amount,
                      amountInWords: totalAmountInWords,
                      selected_bill_no: req.body.selectedbillNo,
                      status: "Pending",
                      created_by: req.user.name,
                      updated_at: Date.now()
                    });
                    pay.save((err) =>{
          
                      if(err){
                        res.json({message: err.message, type: 'danger'});
                      }else{
        
                        SupplierAccount.findOne({_id: req.body.supplierID}, (err, foundSuppItem)=>{ 
                          if (err){
                            res.json({message: err.message, type: 'danger'});
                          }else{
        
                          
        
                        // -------------------------------> saving payment mode
        
        
                              if (req.body.paymentMode === "Bank Transfer"){
        
                                let transfer = ({
                                  b_name:  foundSuppItem.beneficiary_name,
                                  b_address: foundSuppItem.beneficiary_address,
                                  payment_from: Bank_Name,
                                  bank_name:  foundSuppItem.bank_name,
                                  iban_no: foundSuppItem.iban_no,
                                  swift_code: foundSuppItem.swift_code,
                                  transfer_charge: req.body.transferCharge,
                                  transfer_purpose: req.body.transferPurpose,
                                  currency: req.body.curreny,
                                  amount: + (req.body.bankAmount).split(',').join(''),
                                  amountInWords: req.body.amountInWords,
                                  transfer_amount: + (req.body.bankTransferAmount).split(',').join('')
                      
                                });
                                PaymentVoucher.findOne({payment_voucher_no: req.body.pavNo},(err, foundVoucher)=>{
                                  if(err){
                                    res.json({message: err.message, type: 'danger'});
                                  }else{
                                    foundVoucher.bank_transfer.push(transfer);
                                    foundVoucher.save();
                                  }
                                  });
        
                              }else{
        
                             
                              
                                let totalItem = +  req.body.numOfItem;
                               
                                if (totalItem === 1) {
        
                                  let cheque = ({
                                    cheque_no:  req.body.chequeNo,
                                    beneficiary_name:  req.body.beneficiaryName,
                                    cheque_date:  req.body.chequeDate,
                                    cheque_status: req.body.chequeStatus,
                                    cheque_amount:  + (req.body.chequeAmount).split(',').join('')
                                  });
                                  PaymentVoucher.findOne({payment_voucher_no: req.body.pavNo}, (err, foundCheque)=>{
                                    if(err){
                                      res.json({message: err.message, type: 'danger'});
                                    }else{
                                      foundCheque.cheque.push(cheque);
                                      foundCheque.save();
                                    }
                                    });

                                }else{
        
                                      for (var i = 0; i < totalItem; i++){
                        
                                      let chequeMany = ({
                                        cheque_no:  req.body.chequeNo[i],
                                        beneficiary_name:  req.body.beneficiaryName[i],
                                        cheque_date:  req.body.chequeDate[i],
                                        cheque_status: req.body.chequeStatus[i],
                                        cheque_amount:  + (req.body.chequeAmount[i]).split(',').join('')
                                      });
                                      PaymentVoucher.findOne({payment_voucher_no: req.body.pavNo},(err, foundCheque)=>{
                                        if(!err){
                                          foundCheque.cheque.push(chequeMany);
                                          foundCheque.save();
                                        }
                                        });
                                    }
                                  }
                              }
                            }
                          });
        
        
                        // -------------------------------> updating bank account deposited and withdrawal
                        Bank_Withdrawal += payment_amount;
                        Bank_Deposited -= payment_amount;
        
        
                        BankAccount.findOneAndUpdate({_id: req.body.paymentFrom},
                          {$set: {
                          deposited: Bank_Deposited,
                          withdrawal: Bank_Withdrawal }},(err)=>{
                            if (err){
                                res.json({message: err.message, type: 'danger'});
                            }
                        });
        
        
                           // -------------------------------> updating supplier account billed and paid
                           SupplierAccount.findOne({_id: req.body.supplierID,}, (err, foundItem)=>{ 
                          if (err){
                            res.json({message: err.message, type: 'danger'});
                          }else{
                           
                            let totalBilled = foundItem.billed;
                            let totalPaid = foundItem.paid;
        
                            totalPaid +=payment_amount;
                            totalBilled -= payment_amount;
        
                            SupplierAccount.findOneAndUpdate({_id: req.body.supplierID},
                                    {$set: {
                                    billed: totalBilled,
                                    paid: totalPaid }}, (err)=>{
                                      if (err){
                                        res.json({message: err.message, type: 'danger'});
                                      }
                                  });
        
                        
                             // -------------------------------> updating supllier bill status
                              if (parseFloat(req.body.numOfBill) <= 1){
                                    
                                SupplierBill.findOneAndUpdate({bill_number: req.body.selectedbillNo},
                                  {$set: {status: 'Paid' }}, (err)=>{
                                  
                                    if (err){
                                        res.json({message: err.message, type: 'danger'});
                                    }
                                });
        
                              }else if (parseFloat(req.body.numOfBill) >= 2){
        
                                for(var i = 0; i < req.body.selectedbillNo.length; i++){
                                
                                    SupplierBill.findOneAndUpdate({bill_number: req.body.selectedbillNo[i]},
                                    {$set: {status: 'Paid' }}, (err)=>{
                                   
                                      if (err){
                                        res.json({message: err.message, type: 'danger'});
                                      }
                                  });
        
                                 }
                              }
                           
                            }
        
                          });
        
                          SupplierAccount.findOne({_id: req.body.supplierID }, (err, supBills)=>{ 
                            
                            if(err){
                                res.json({message: err.message, type: 'danger'});
                            }else{
                           
                                SupplierAccount.findOneAndUpdate({_id: req.body.supplierID},
                                {$set: {
                                created_bills: supBills.created_bills - parseFloat(req.body.numOfBill) }}, (err)=>{
                                  if (err){
                                    res.json({message: err.message, type: 'danger'});
                                  }
                              });
            
                            }
            
                          });
        
        
                         // -------------------------------> updating setting for payment voucher number
                          Settings.findOne({name: "payment_voucher_settings"}, (err, billSetting)=>{
                        
                          let pavno = parseFloat(billSetting.starting_no) + 1;
          
                              Settings.findOneAndUpdate({name: "payment_voucher_settings"},
                                {$set: {starting_no:  pavno}}, (err)=>{
                                  if(err){
                                    res.json({message: err.message, type: 'danger'});
                                  }
                              });
                          }); 

                          PaymentVoucher.findOne({payment_voucher_no: req.body.pavNo}, function(err, foundPav){
                            if(err){
                              res.json({message: err.message, type: 'danger'});
                            }else{

                                req.session.message = {
                                  type: 'transac',
                                  tType: 'pay',
                                  message: 'Payment Voucher has been successfully created. Voucher No: ' + req.body.pavNo +' Amount: QAR '+req.body.totalPayment,
                                  transID: foundPav._id,
                                 };

                                 res.redirect("/supplier-accounts");
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