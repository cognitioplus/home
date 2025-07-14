//require common model
const commonModel = require('../models/common');
const projectModel = require('../models/projects');
//require project setting json
const widgetSettings = require('../config/project_settings.json');
const moment = require('moment');

var dateTime = new Date()

exports.getProjectAppearance=async(req, res)=>{
    if(req.session.Id){
        var wh = {id:req.params.id}
        //get project-appearance page.
        await commonModel.selectData('*','pt_projects',wh).then(async getProject=>{
            var cond = {project_id:req.params.id}
            await commonModel.selectData('project_setting','pt_project_settings',cond).then(async getProjectSetting=>{
                var ds = JSON.parse(getProjectSetting[0].project_setting)
                res.render('project-appearance',{project:getProject[0],setting:ds,users:req.session.user,access_level:req.session.al,nm:req.session.name,'menu':'project-appearance'});
            }).catch(err=>{
                res.json({status:false, message:'Project Setting not found.'});
            });
        }).catch(err=>{
            res.json({status:false,message:'There is no project.'})
        });
    }else{
        res.redirect('/')
    }
}

exports.widgetSetting=async(req, res)=>{
    var id = req.params.id
    var settingJson = req.body
    widgetSettings.theme.color_class = settingJson.theme_color
    widgetSettings.widget_title = settingJson.widget_title
    widgetSettings.login_screen_contents.heading = settingJson.lc_heading
    widgetSettings.login_screen_contents.sub_heading = settingJson.lc_sub_heading
    widgetSettings.login_screen_contents.name.label = settingJson.lc_name_label
    widgetSettings.login_screen_contents.name.placeholder = settingJson.lc_name_ph
    widgetSettings.login_screen_contents.email.label = settingJson.lc_email_label
    widgetSettings.login_screen_contents.email.placeholder = settingJson.lc_email_ph
    widgetSettings.login_screen_contents.button = settingJson.lc_button

    widgetSettings.offline_screen_contents.heading = settingJson.oc_heading
    widgetSettings.offline_screen_contents.sub_heading = settingJson.oc_sub_heading
    widgetSettings.offline_screen_contents.name.label = settingJson.oc_name_label
    widgetSettings.offline_screen_contents.name.placeholder = settingJson.oc_name_ph
    widgetSettings.offline_screen_contents.email.label = settingJson.oc_email_label
    widgetSettings.offline_screen_contents.email.placeholder = settingJson.oc_email_ph 
    widgetSettings.offline_screen_contents.message.label = settingJson.oc_msg_label
    widgetSettings.offline_screen_contents.message.placeholder = settingJson.oc_msg_ph
    widgetSettings.offline_screen_contents.button = settingJson.oc_button

    widgetSettings.error_message.err_msg = settingJson.em_err_msg
    widgetSettings.error_message.email_err_msg = settingJson.em_email_err_msg
    widgetSettings.widget.type = settingJson.widget_type
    widgetSettings.widget.text = settingJson.widget_button_text
    widgetSettings.position = settingJson.widget_position

    var where = {project_id :id}
    var data = {
        'project_setting' : JSON.stringify(widgetSettings),
        updatedAt : moment(dateTime).format("YYYY-MM-DD HH:mm:ss")
    }
    await projectModel.updateProjectSetting('pt_project_settings',data,where).then(updtSetting=>{
        res.send({status:true,message:'Project setting updated.',stt:updtSetting})
    }).catch(err=>{
        res.json({status:false, message:'Project Setting not updated.'});
    });
}

