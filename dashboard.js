const commonController = require('./common');
const commonModel = require('../models/common');
const dashboardModel = require('../models/dashboard');
const projectModel = require('../models/projects');
const moment = require('moment');
   
exports.getdashboard=async (req, res)=>{
    if(req.session.Id){
        var where = {
            id:req.session.Id
        }
        await commonModel.selectData('name,email,project_id','pt_users',where).then(async findNotification=>{
            var con 
            if(findNotification[0].project_id!=''){
                con = {
                    id : findNotification[0].project_id
                }
            }else{
                con=''
            }
            await projectModel.findProject('id,project_name','pt_projects',con).then(async allProjects=>{ 
                res.render('dashboard',{projects:allProjects,users:req.session.user,access_level:req.session.al,nm:req.session.name});   
            }).catch(err=>{
                res.json({status:false,message:'not found projects.'})
            });       
        }).catch(err=>{
            res.json({status:false,message:'not found any user.'})
        });
    }else{
        res.redirect('/')
    }
}

exports.mapCustomer=async (req,res)=>{
    if(req.body.title != 'Custom Range'){
        var date = req.body.date.split('-')
        await dashboardModel.dateWiseCustomer(date).then(async getData=>{
            var jsonData = {};
            let sDate = moment(date[0]).format('YYYY-MM-DD');
            let eDate = moment(date[1]).format('YYYY-MM-DD');
            let dayCount = moment(date[1]).diff(moment(date[0]),'days');
            
            for(let d=0;d<=dayCount;d++) {
                jsonData[moment(sDate).add(d,'days').format('YYYY-MM-DD')]=0;
            }
            
            getData.forEach(element => {
                jsonData[moment(element.createdAt).format('YYYY-MM-DD')] = element.count;
            });
            
            res.json({status:true,countCustomer:jsonData})
        }).catch(err=>{
            res.json({status:false,message:'can not found any customer.'})
        });
    }else{
        var date = req.body.date.split('-')
        await dashboardModel.monthWiseCustomer(date).then(async getData=>{
            var jsonData = {};
            let sDate = moment(date[0]).format('MM');
            let eDate = moment(date[1]).format('MM');
            let monthCount = moment(date[1]).diff(moment(date[0]),'month', true);
            for(let d=0;d<=monthCount;d++) {
                jsonData[moment(sDate).add(d,'month').format('MMMM')]=0;
            }
            
            getData.forEach(element => {
                jsonData[moment(element.createdAt).format('MMMM')] = element.count;
            });
            
            res.json({status:true,countCustomer:jsonData})
        }).catch(err=>{
            res.json({status:false,message:'can not found any customer.'})
        });
    }
}

exports.getCustomer=async(req,res)=>{
    var where
    if(req.params.id !=0){
        where = {id:req.params.id,active:1}
    }else{
        where = {active:1}
    }
    await dashboardModel.countActiveCustomer(where).then(async activeCustomer=>{
        var cond
        if(req.params.id!=0){
            cond = {id:req.params.id}
        }else{
            cond = ''
        }
        await dashboardModel.countCustomer(cond).then(async customer=>{
            res.send({status:true,activeCustomer:activeCustomer[0],customer:customer[0]}) 
        }).catch(err=>{
            res.json({status:false,message:'Total customer not found.'})
        });
    }).catch(err=>{
        res.json({status:false,message:'active customer not found.'})
    });
}
