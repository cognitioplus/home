const moment = require('moment');
const md5 = require('md5');
const sendMail = require('../config/mailapi');
const commonModel = require('../models/common');
const userModel = require('../models/users');
const projectModel = require('../models/projects');
const coversationTicketModel = require('../models/conversation_ticket');

var dateTime = new Date()

exports.getOperatorPage =async (req, res)=>{
    if(req.session.Id){
        var wh = {access_level:2}
        //get operator page.
        await commonModel.selectData('*','pt_users',wh).then(async findOperator=>{
            var projectArray = [];
            //get all projects.
            await commonModel.selectData('id,project_name','pt_projects','').then(async findProject=>{
                for await (let user of findOperator) {
                    if(user.project_id != null){
                        projectArray.push({
                            ...user,
                            projectData: await pt_project(user.project_id),
                            createdDate: moment(user.createdAt).format('LL')
                        });
                    }
                }
                res.render('operators',{projects:findProject,users:req.session.user,nm:req.session.name,access_level:req.session.al,Operator:projectArray});
            }).catch(err=>{
                res.json({status:false, message:'Operator not found.'});
            });
        }).catch(err=>{
            res.json({status:false,message:'Users not found.'});
        });
    }else{
        res.redirect('/')
    }
}

exports.createOperator=async(req, res)=>{
    var name = req.body.name
    var email = req.body.email
    var password = req.body.password
    var project_id = req.body.project
    
    var cond = {email :email, access_level:2}
    //find Users from user table.
    await userModel.findUser(cond).then(async findUser=>{
        if(findUser.length==0){
            let m =  await sendMail(email, password);
            if(m.messageId){
                var addOperator = {
                    name : name,
                    email : email,
                    password : md5(password),
                    project_id : project_id,
                    access_level : 2,
                    createdAt : moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                } 
                //add user as a operator.
                await commonModel.insertData('pt_users',addOperator).then(Operator=>{
                    if(Operator){
                        res.json({status:true, message:'Operator added.', data:Operator});
                    }else{
                        res.json({status:false, message:'Operator not added.'});
                    }
                }).catch(err=>{
                    res.json({status:false, message:'Operator not added.'});
                });
            }else{
                res.json({status:false, message:'We are not able to send email now, please try after sometime!'});
            }
        }else{
            res.json({status:false, message:'This operator is already exists...Try another.'});
        }
    }).catch(err=>{
        res.json({status:false, message:'Users not found.'});
    })
}

exports.getEditOperator=async(req,res)=>{
    var where = {id:req.query.id}
    await commonModel.selectData('id,name,email,project_id','pt_users',where).then(async operator=>{
        res.json({status:true,operator:operator});
    }).catch(err=>{
        res.json({status:false, message:'Operator not found.'});
    })
}

exports.updateOperator=async(req, res)=>{
    var name = req.body.name
    var email = req.body.email
    var project_id = req.body.project_id
    var id = req.body.id
    var password = req.body.password
    var postData
    if(password!=''){
        postData = {name:name, email:email,password:md5(password),project_id:project_id,
            updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
    }else{
        postData = {name:name,email:email,project_id:project_id,
            updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
    }

    var where={id:id}
    await commonModel.updateData('pt_users',postData,where).then(editOperator=>{
        res.json({status:true, message:'Operator updated.',data:editOperator})
    }).catch(err=>{
        res.json({status:false, message:'Operator not updated.'})
    });
}

exports.deleteOperator=async(req, res)=>{
    var id = req.body.id
    var where = {id:id}
    //delete operator.
    await commonModel.deleteData('pt_users',where).then(deleteUsers=>{
        res.json({status:true, message:'Operator deleted.'})
    }).catch(err=>{
        res.json({status:false, message:'Operator not deleted.'})
    });
}

exports.sendMsgOperator=async(req, res)=>{
    var project_id = req.body.project_id
    var customer_id = req.body.customer_id
    var operator_id = req.body.operator_id
    var message = req.body.msg
    var time = req.body.time
    
    var where = {project_id:project_id,customer_id:customer_id}
    //functionality of find conversation ticket id. 
    await coversationTicketModel.findManyColumn('id',where).then(async findTicket=>{
        if(findTicket.length>0){
            var conversationData = {
                operator_id:operator_id,
                conversation_id:findTicket[0].id,
                project_id:project_id,
                message:message,
                msg_read:0,
                createdAt : moment(time).format("YYYY-MM-DD HH:mm:ss")
            }
            //add coversation from operator end. 
            await commonModel.insertData('pt_conversations',conversationData).then(addCoversation=>{
                res.json({status:true,message:'coversation added.'})
            }).catch(err=>{
                res.json({status:false,message:'coversation not added.'})
            });
        }else{
            res.json({status:false,message:'Conversation ticket not found.'});
        }
    }).catch(err=>{
        res.json({status:false,message:'Conversation ticket not found.'});
    });
}

exports.checkActiveOperator=async(req,res)=>{
    var wh = {active:1, id:req.session.Id}
    await userModel.activeOperator(wh).then(async findOperator=>{
        res.json({status:true, operator:findOperator})
    }).catch(err=>{
        res.json({status:false,message:'Active operator not found.'});
    });
}

//function for get project name by group_concat. 
async function pt_project(projectId){
    var splitId = projectId.split(',')
    var fieldName = 'GROUP_CONCAT(project_name) AS project_name';
    var where = {
        id : splitId
    }
    var findProject =await projectModel.findProject(fieldName,'pt_projects',where);
    return findProject;
}
