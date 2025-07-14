const crypto = require('crypto');  
const moment = require('moment');

//require common model
const commonModel = require('../models/common');
const projectModel = require('../models/projects');
const conversationModel = require('../models/conversation');
const settingJson = require('../config/project_settings.json');

var dateTime = new Date()
exports.getProjects=async(req, res)=>{
    if(req.session.Id){
        var wh 
        if(req.session.al==2){
            var wh = {id : req.session.pid} 
        }else{
            wh = ''
        }
        await projectModel.findProject('*','pt_projects',wh).then(async project=>{
            var projectArray = [];
            for await (let p of project) { 
                projectArray.push({
                    ...p,
                    unreadMsg:await pt_message_notification(p.id),
                });
            }
            res.render('projects',{project : projectArray, users:req.session.user,nm:req.session.name,access_level:req.session.al});
        }).catch(err=>{
            res.json({status:false, message:'Project not found.'});
        });
    }else{
        res.redirect('/')
    }
}

exports.getCreateProject=async(req, res)=>{
    if(req.session.Id){
        var wh = {access_level:2}
        await commonModel.selectData('id,name','pt_users',wh).then(async findOperator=>{
            res.render('create-project',{ operator:findOperator,users:req.session.user,nm:req.session.name,access_level:req.session.al});
        }).catch(err=>{
            res.json({status:false, message:'Operator not found.'});
        });
    }else{
        res.redirect('/')
    }
}

exports.postCreateProject=async(req, res)=>{
    var project_name = req.body.project_name
    var url = req.body.url
    var id = req.body.id
    var project_id

    
    if(id){
        settingJson.widget.type = req.body.widget_type
        settingJson.position = req.body.pos_checked
        var projData={
            'project_setting':JSON.stringify(settingJson),
            'updatedAt':moment(dateTime).format("YYYY-MM-DD HH:mm:ss"),
        }
        project_id = id
        var where={ project_id:project_id}
        //create project setting.
        await projectModel.updateProjectSetting('pt_project_settings',projData,where).then(addSetting=>{
            var enc_data =  encrypt(id)
            if(addSetting) return res.json({status:true, message:'Project setting saved.',enc_data:enc_data});
            res.json({status:false, message:'Project setting not saved.'});
        }).catch(err=>{
            res.json({status:false, message:'Project not updated.'});
        })
    }else{
        var cond = {project_name:project_name}
        await commonModel.selectData('project_name','pt_projects',cond).then(async result=>{
            if(result.length>0){
                res.json({status:false, message:'Project name already exists....Please Try another name.'});
            }else{
                var addProjectData = {
                    'project_name':project_name,
                    'url':url,
                    'status':1,
                    'createdAt':moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                }

                //add projects.
                await commonModel.insertData('pt_projects',addProjectData).then(async projectAdd=>{
                    if(projectAdd){
                        project_id = projectAdd.insertId
                        var insertSetting = await projectSetting(project_id)
                        res.json({status:true, message:'Project added.', data:projectAdd});
                    }else{
                        res.json({status:false, message:'Project not added.'});
                    }
                }).catch(err=>{
                    res.json({status:false, message:'Project not added.'});
                });
            }
        }).catch(err=>{
            res.json({status:false,message:'project exist.'})
        });
    }
}

exports.editProject=async(req,res)=>{
    if(req.session.Id){
        var wh = {id:req.params.id}
        //get project-script page.
        await commonModel.selectData('id,project_name,url','pt_projects',wh).then(async getProject=>{
            var whr = {access_level:2}
            await commonModel.selectData('id,name,project_id','pt_users',whr).then(async findOperator=>{                    
                res.render('project-edit',{project:getProject[0],operator:findOperator,users:req.session.user,nm:req.session.name,access_level:req.session.al});
            }).catch(err=>{
                res.json({status:false, message:'Operator not found.'});
            });
        }).catch(err=>{
            res.json({status:false,message:'There is no project.'})
        });
    }else{
        res.redirect('/')
    }
}

exports.updateProject=async(req, res)=>{
    var postData = {project_name :req.body.project_name,updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
    var where = {id:req.body.id}
    await commonModel.updateData('pt_projects',postData,where).then(async updtProject=>{
        res.json({status:true,message:'Project name changed successfully.'})
    }).catch(err=>{
        res.json({status:false,message:'Project name not changed.'})
    });
}

exports.updateFav=async(req, res)=>{
    var id = req.body.id
    var where ={id:id}
    //find projects favorite value.
    await commonModel.selectData('*','pt_projects',where).then(async findProject=>{  
        if(findProject){
            var cond={'id':id};
            if( findProject[0].favourite=='0'){
                var postData = {
                    favourite:1,
                    updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                }
                //update projects favorite value.
                await commonModel.updateData('pt_projects',postData,cond).then(updProj=>{
                    res.json({status:true, message:'Project added to favourite.'});
                }).catch(err=>{
                    res.json({status:false, message:'Project not added to favourite.'});
                });
            }else{
                var postData = {
                    favourite:0,
                    updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                }
                //update projects favorite value.
                await commonModel.updateData('pt_projects',postData,cond).then(updProj=>{
                    res.json({status:true, message:'Project updated.'});
                }).catch(err=>{
                    res.json({status:false, message:'Project not updated.'});
                });
            }
        }
    }).catch(err=>{
        res.json({status:false, message:'Project not found.'});
    });
}

function encrypt(id){
    var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq');
    var crypted = cipher.update(id,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

//function for get message notification. 
async function pt_message_notification(id){
    var where = {
        project_id : id, 
        operator_id :'0',
        msg_read : 0
    }
    var findUnreadMessage =await conversationModel.countProjectUnreadMsg(where);
    return findUnreadMessage[0].msg_read;  
}

async function projectSetting(project_id){
    var projData={
        'project_setting':JSON.stringify(settingJson),
        'createdAt':moment(dateTime).format("YYYY-MM-DD HH:mm:ss"),
        'project_id':project_id
    }
    //create project setting.
    var addSetting = await commonModel.insertData('pt_project_settings',projData)
        return addSetting;
}