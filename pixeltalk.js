const crypto = require('crypto');  
const moment = require('moment');
//require common model
const commonModel = require('../models/common');
const customerModel = require('../models/customer');
const coversationTicketModel = require('../models/conversation_ticket');
const notificationModel = require('../models/notification');
const sJson = require('../config/settings.json');
var dateTime = new Date()

exports.checkProject= async(req, res)=>{
    var id = req.body.id
    var url = req.body.url
    var decId = decrypt(id)
    var where = {id:decId}
    
    //check project is exists or not.
    await commonModel.selectData('id,project_name,url,status,DATE_FORMAT(auto_expires, "%Y-%m-%d") AS auto_expires','pt_projects',where).then(async findProject=>{
        if((findProject[0].auto_expires)==ptCurrentDate()){
            res.json({status:false,message:'project expired.'}); 
        }else{
            if(findProject[0].url==url){
                var cond = {project_id:decId}
                //get project settings json, if project exists. 
                await commonModel.selectData('project_setting','pt_project_settings',cond).then(settingData=>{
                    var sd = JSON.parse(settingData[0].project_setting)
                    var ddd = entities(sd.offline_screen_contents.sub_heading)
                    sd.offline_screen_contents.sub_heading = ddd    
                    res.json({status:true,message:'project exists.',px_project:findProject,project_id:decId,setting:sd,pt_local_url:sJson.Basic_URL}); 
                }).catch(err=>{
                    res.json({status:false,message:'Project not exists.'});
                });
            }
        }
    }).catch(err=>{
        res.json({status:false,message:'Project not found.'});
    });
}

exports.serverRequest =async (req, res)=>{
    var id = req.params.id
    var name = req.body.name
    var email = req.body.email
    var customer_ip = req.body.customer_ip
    var decId = decrypt(id)
    var where = {email:email,'project_id':decId}
    //find customer.
    var w = {id:decId}
    var pName = await commonModel.selectData('id,project_name','pt_projects',w);
    await customerModel.findCustomer('id,name,email',where).then(async findCustomer=>{
        if(findCustomer.length > 0){
            var postData = {
                active:1,
                updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
            }
            var wh = {
                id:findCustomer[0].id
            }
    
            //check project is exists or not.
            //if customer exists than update activity of customer.
            await commonModel.updateData('pt_customers',postData,wh).then(async updateCustomer=>{
                var condition = {
                    customer_id:findCustomer[0].id,
                    project_id : decId
                }
                //find conversation id from Conversation Ticket.
                await coversationTicketModel.findManyColumn('id',condition).then(findTicket=>{
                    res.json({status:true,px_customer:findCustomer,px_project:pName,conId:findTicket});
                }).catch(err=>{
                    res.json({status:false,message:'Conversation Ticket not found.'});
                });
            }).catch(err=>{
                res.json({status:false,message:'Customer not updated.'});
            });
        }else{
            var postData = {
                email:email,
                name:name,
                customer_ip:customer_ip,
                active:1,
                project_id:decId,
                createdAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
            }
            //if customer not exists than add customer.
            await commonModel.insertData('pt_customers',postData).then(async newCustomer=>{
                var wh = {id:newCustomer.insertId,'project_id':decId}
                await customerModel.getCustomer('id,name',wh).then(async customer=>{
                   var con_tick = {
                        customer_id:newCustomer.insertId,
                        project_id:decId,
                        createdAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                    }
                    //add conversation id in Conversation Ticket.
                    await commonModel.insertData('pt_conversation_tickets',con_tick).then(async addTicket=>{
                        res.json({status:true,message:'Conversation Ticket added.',px_customer:customer,px_project:pName,conId:addTicket});
                    }).catch(err=>{
                        res.json({status:false,message:'Customer not added.'});
                    });
                }).catch(err=>{
                    res.json({status:false,message:'Customer not added.'});
                });
            }).catch(err=>{
                res.json({status:false,message:'Customer not added.'});
            });
        } 
    }).catch(err=>{
        res.json({status:false,message:'Customer not found.'});
    });
}

exports.sendMessage=async(req, res)=>{
    var conversation_id = req.body.conversation_id
    var customer_id = req.body.customer_id
    var project_id = req.body.project_id
    var message = req.body.message
    var time = req.body.time
    var where = {customer_id : customer_id}
    //find conversation id from Conversation Ticket.
    await commonModel.selectData('*','pt_conversation_tickets',where).then(async findticket=>{
        if(findticket){
            var addCon = {
                conversation_id : conversation_id,
                operator_id : 0,
                project_id :project_id,
                message : message,
                msg_read :0,
                createdAt : moment(time).format("YYYY-MM-DD HH:mm:ss")
            }
            //if customer id is exist than Conversation added.
            await commonModel.insertData('pt_conversations',addCon).then(async addCoversation=>{
                var type 
                if(conversation_id != ''){
                    type = 'chat'
                }
                var cond={conversation_id:conversation_id,type:type}
                //find conversation id is exists or not in notifications. 
                await notificationModel.selectData('id','pt_notifications',cond).then(async findnotification=>{
                    if(findnotification.length>0){
                           var notifyData = {
                            msg_read : 0,
                            updatedAt : moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                        }
                        //conversation id exists in notifications than it will update notification. 
                        await notificationModel.updateData(notifyData,cond).then(updtNot=>{
                            res.json({status:true, message:'notification updated.'});
                        }).catch(err=>{
                            res.json({status:false,message:'notification not updated.'});
                        });
                    }else{
                        var notifyData = {
                            type : type,
                            customer_id:customer_id,
                            project_id:project_id,
                            conversation_id:conversation_id,
                            msg_read : 0,
                            createdAt : moment(time).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt : moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                        }
                        //conversation id not exists in notifications than it will add notification. 
                        await commonModel.insertData('pt_notifications',notifyData).then(addNot=>{
                            res.json({status:true, message:'notification added.'});
                        }).catch(err=>{
                            res.json({status:false,message:'notification not added.'});
                        });
                    }
                }).catch(err=>{
                    res.json({status:false,message:'notification not added.'})
                });
            }).catch(err=>{
                res.json({status:false,message:'Message not FOUND.'});
            });
        }
    }).catch(err=>{
        res.json({status:false,message:'Conversation ticket not found.'});
    });
}

exports.pxcustomer=async(req, res)=>{
    var where = {id:req.body.id}
    //find customer.
    await commonModel.selectData('*','pt_customers',where).then(async findCustomer=>{
        if(findCustomer.length>0){
            res.json({status:true,message:'Customer exist.'});
        }else{
            res.json({status:false,message:'Customer not exists.'});
        }
    }).catch(err=>{
        res.json({status:false,message:'Customer not exists.'});
    });
}

exports.updateCustomer=async(req, res)=>{
    var customer_id = req.body.customer_id
    var where = {id : customer_id}
    var postData = {active:0,'updatedAt':moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}

    //update customer activity.
    await commonModel.updateData('pt_customers',postData,where).then(async updtCustomer=>{
        res.json({status:true,message:'Customer updated.'});
    }).catch(err=>{
        res.json({status:false,message:'Customer not updated.'});
    });
}

function decrypt(id){
    var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq');
    var dec = decipher.update(id,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

function ptCurrentDate(){
    var pt_dt = new Date();
    var pt_date = pt_dt.getDate(), pt_month =  pt_dt.getMonth()+1, pt_year = pt_dt.getFullYear();
    if (pt_date.toString().length == 1) {
        pt_date = "0" + pt_date;
    }

    if (pt_month.toString().length == 1) {
        pt_month = "0" + pt_month;
    }

    var pt_Current_date = pt_year+'-'+pt_month+'-'+pt_date;
    return pt_Current_date;
}

function entities(str) {
    return String(str).replace('&amp;', '&').replace('&lt;','<').replace('&gt;','>').replace('&quot;','"').replace("&eq;","'");
}