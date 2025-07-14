const md5 = require('md5');
const moment = require('moment');
const crypto = require('crypto');

//module require
const commonModel = require('../models/common');
const userModel = require('../models/users');
const sendMail = require('../config/mailapi');
var dateTime = new Date()

exports.getLoginPage= (req, res)=>{
    if(!req.session.Id){
        if(req.headers.cookie){
            var c=req.headers.cookie.split(';')
            var cJson = {};
            for (var i = 0; i < c.length; i++) {
                var t = c[i].split("=");
                if (t.length && t.length >= 2) {
                    var k = t[0].trim(),
                    v = t[1].trim();
                    cJson[k]=v
                }
            }
            if(cJson.email && cJson.password){
                cJson.email=decodeURIComponent(cJson.email)
                cJson.password= decrypt(cJson.password)
                res.render('login',{email:cJson.email,password:cJson.password})
            }else{
                res.render('login',{email:'',password:''})
            }
        }
    }else{
        res.redirect('/dashboard')
    }
}

exports.loginUser= async(req, res)=>{ 
    var email = req.body.email
    var password = req.body.password
    var where = {email:email}
    await commonModel.selectData('*','pt_users',where).then(async user=>{
        if(user.length==0){
            res.send({status:false, message:'Email not exists.'});
        }else{
            if(user[0].password == md5(password)){
                if(req.body.remember_me!='null'){
                    res.cookie('email',email);
                    res.cookie('password',encrypt(password));
                }
                var userData = {
                    active:1,
                    'updatedAt':moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                }
                var wh = {id : user[0].id}
                await commonModel.updateData('pt_users',userData,wh).then(addUser=>{
                    req.session.al = user[0].access_level
                    req.session.pid = user[0].project_id
                    req.session.loggedIn=true
                    req.session.Id=user[0].id
                    if(user[0].name){
                        var name = user[0].name 
                        var nm = name.split(' ')
                        var fn='',ln=''
                        if(nm[0]) fn = nm[0][0];
                        if(nm[1]) ln = nm[1][0]
                        var nm1 =''
                        if(ln){ nm1 = fn+ln }
                        else{ nm1 = fn }
                        req.session.name=nm1
                    }
                    req.session.user = user[0].name
                    res.send({status:true, message:'Login successfully.'});
                }).catch(err1=>{
                    res.send({status:false, message:'Login failed.'});
                });
            }else{
                res.send({status:false, message:'password not matched.'});
            }
        }  
    }).catch(err=>{
        res.send({status:false, message:'Email not exists.'});
    });
   
}

exports.getForgotPassword=async(req, res)=>{
    res.render('forgot-password')
}


module.exports.postForgotPassword=async(req, res)=>{
    var email =  req.body.email
    var newPassword = req.body.newPassword
    var where = {email : email}
    await commonModel.selectData('email','pt_users',where).then(async result=>{
        if(result.length>0){
                let m =  await sendMail(email, newPassword);
                if(m.messageId){
                    var postData = {
                        password:md5(newPassword),
                        resetPasswordToken:md5(newPassword),
                        updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
                    }
                    await userModel.updatePassword('pt_users',postData,where).then(async updateData=>{
                        res.json({status:true,message:'Please check your mail inbox!'})
                    }).catch((err)=>{
                        res.json({status:false,message:'Password not updated',error:err})
                    });
                }else{
                    res.json({status:false,message:'We are not able to send email now, please try after sometime!'})
                }
        }else{
            res.json({status:false,message:'Email not exists!!'})
        }
    }).catch((err)=>{
        res.json({status:false,message:'Email not exists!!',error:err})
    });
}

exports.logout=async(req, res)=>{
    if(req.session.Id){
        var id = req.session.Id
        var data={active:0,updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
        var where={id:id}
        await commonModel.updateData('pt_users',data,where).then(updtUser=>{
            req.session.destroy();
            res.redirect('/')
        }).catch(err=>{
            console.log(err)
        });
    }else{
        res.redirect('/')
    }
}

function encrypt(password){
    var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq');
    var crypted = cipher.update(password,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(password){
    var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq');
    var dec = decipher.update(password,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}
