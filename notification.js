const commonModel = require('../models/common');
const commonController = require('./common');
const moment = require('moment');

var dateTime = new Date()

exports.getCustomer=async(req,res)=>{
    if(req.session.Id){
        var id = req.params.id
        var cid =req.query.customer_id
        var type = req.query.notify_type
        if(type === 'new'){
            var postData = {msg_read:1,updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
            var where = {customer_id:cid}
            await commonModel.updateData('pt_notifications',postData,where).then(result=>{        
                res.redirect('/projects/chat/'+id+'?u-id='+cid);
            }).catch(err=>{
                res.json({status:false,message:'Notification not updated.'})
            });
        }else{
            res.redirect('/projects/chat/'+id+'?u-id='+cid);
        }
    }else{
        res.redirect('/')
    }
}

exports.getNotification=async(req,res)=>{
    if(req.session.Id){
        var where = {
            id:req.session.Id
        }
        await commonModel.selectData('name,email,project_id','pt_users',where).then(async findNotification=>{
            var notifyArray = [];
            for await (let n of findNotification) { 
                notifyArray.push({
                    customer_name:await commonController.getCustomer(n.project_id)
                });
            }
            var notify = JSON.parse(notifyArray[0].customer_name)
            res.json({status :true,notification:notify});
        }).catch(err=>{
            res.json({status:false, message:'Operator not found.'});
        });
    }else{
        redirect('/')
    }
}
