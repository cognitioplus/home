const moment = require('moment');

//require common model
const commonModel = require('../models/common');
const projectModel = require('../models/projects');
const deleteController = require('./delete');

var dateTime = new Date()

exports.getProjectSetting=async(req, res)=>{
    if(req.session.Id){
        var wh = {id:req.params.id}
        //get project setting page.
        await commonModel.selectData('*','pt_projects',wh).then(async getProject=>{
            var projectArray = [];
            for await (let project of getProject) {
                projectArray.push({
                    ...project,
                    expiry: moment(project.auto_expires).format('MMM D, YYYY')
                });
            }
            res.render('project-settings',{project:projectArray[0],users:req.session.user,access_level:req.session.al,nm:req.session.name,'menu':'project-settings'});
        }).catch(err=>{
            res.json({status:false,message:'There is no project.'});
        });
    }else{
        res.redirect('/')
    }
}

exports.statusControl=async(req, res)=>{
    var uptData = {status:req.body.status,'updatedAt':moment(dateTime).format("YYYY-MM-DD HH:mm:ss")} 
    var wh = {id:req.body.id}
    //update project status.
    await commonModel.updateData('pt_projects',uptData,wh).then(statusChange=>{
        res.json({status:true,message:'status updated successfully.'})
    }).catch(err=>{
        res.json({status:false,message:'status not updated.'})
    });
}

exports.expiresProject=async(req, res)=>{
    var exp_date = req.body.date
    var uptData = {
        auto_expires:moment(exp_date).format('YYYY-MM-DD HH:mm:ss'),
        'updatedAt':moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
    } 
    var wh = {id:req.body.id}
    //add project expiry date.
    await commonModel.updateData('pt_projects',uptData,wh).then(statusChange=>{
        res.json({status:true,message:'auto expires added.'})
    }).catch(err=>{
        res.json({status:false,message:'auto expires not added.'})
    });
}

exports.deleteProject=async(req, res)=>{
    var id = req.body.id
    var where = {id:id}
    
    //delete project.
    await commonModel.deleteData('pt_projects',where).then(async deleteUsers=>{
        var wh = {project_id:id}
        var PS = await projectModel.deleteProjectSetting(wh);   
        var customer = await findCustomer(wh)
        if(customer.length>0){
            var userdel =  await deleteController.deleteUsers(wh)
            var dN = await deleteController.deleteNotification(wh)
            var DT = await deleteController.delTicket(wh)
            var cD = await commonModel.deleteData('pt_conversations',wh);
        }
        res.json({status:true, message:'Project deleted.'})
    }).catch(err=>{
        res.json({status:false, message:'Project not deleted.'})
    });
}

async function findCustomer(wh){
    var c = await commonModel.selectData('id','pt_customers',wh);
    return c
}
