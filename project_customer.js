const moment = require('moment');

//require common model
const commonModel = require('../models/common');
const deleteController = require('./delete');

exports.getProjectCustomer=async(req, res)=>{
    if(req.session.Id){
        var wh = {id:req.params.id}
        // find project exist or not.
        await commonModel.selectData('id,project_name','pt_projects',wh).then(async getProject=>{
            var cond = {project_id:req.params.id}
            //find all customer.
            await commonModel.selectData('id,name,email,customer_ip,createdAt','pt_customers',cond).then(async getCustomer=>{
                var customerArray = [];
                for await (let customer of getCustomer) {
                    customerArray.push({
                        ...customer,
                        createdDate: moment(customer.createdAt).format('LL')
                    });
                }
                res.render('project-customers',{project:getProject[0],customer:customerArray,users:req.session.user,access_level:req.session.al,nm:req.session.name,'menu':'project-customers'});
            }).catch(err=>{
                res.json({status:false,message:'There is no customer.'})
            });
        }).catch(err=>{
            res.json({status:false,message:'There is no project.'})
        });
    }else{
        res.redirect('/')
    }
}

exports.deleteCustomer=async(req,res)=>{
    var id = req.body.id
    var where = {id:id}

    //delete customer.
    await commonModel.deleteData('pt_customers',where).then(async deleteUsers=>{
        var wh = {customer_id:id}
        var dN = await deleteController.deleteNotification(wh)
        var fT = await deleteController.findTicket(wh)       
        if(fT){
            var DT = await deleteController.delTicket(wh)
            var cond={conversation_id:fT[0].id}  
            await commonModel.deleteData('pt_conversations',cond).then(async delConversation=>{    
                res.json({status:true, message:'Customer deleted.'})
            }).catch(err=>{
                res.json({status:false, message:'Conversation not deleted.'})
            }); 
        }
    }).catch(err=>{
        res.json({status:false, message:'Customer not deleted.'})
    });
}
