const moment = require('moment');
const commonModel = require('../models/common');
const conversationModel = require('../models/conversation');
const coversationTicketModel = require('../models/conversation_ticket');
const notificationModel = require('../models/notification');

// parameter uses in socket
users = [];
connections = []; 

var dateTime = new Date()

exports.getUser=async(req, res)=>{
    if(req.session.Id){
        var where = {project_id:req.params.id}
        //find customer.
        await commonModel.selectData('id,name,email,project_id,active,createdAt','pt_customers',where).then(async findCustomer=>{
            var customerArray = [];
            var op_id = '0';
            for await (let user of findCustomer) { 
                customerArray.push({
                    ...user,
                    unreadMsg:await pt_unread_message(user.id,op_id),
                    createdDate: moment(user.createdAt).format('LL')
                });
            }
            customerArray.sort(function(a, b) { 
                if (a.unreadMsg.date === '') {
                    return 1;
                }
                else if (b.unreadMsg.date === '') {
                    return -1;
                }
                else {
                    return new Date(b.unreadMsg.date) - new Date(a.unreadMsg.date);
                }
            });
            res.render('project-chat',{ users:req.session.user,userId:req.session.Id,nm:req.session.name,access_level:req.session.al,customer:customerArray,id:req.params.id});
        }).catch(err=>{
            res.json({status:false,message:'There is no Customer.'})
        });
    }else{
        res.redirect('/')
    }
}

exports.getMessage=async(req, res)=>{
    var customer_id = req.body.customer_id
    var project_id = req.body.project_id
    var findTicket = {
        customer_id:customer_id,
        project_id:project_id
    }
    //find conversation ticket id.
    await coversationTicketModel.findManyColumn('id',findTicket).then(async result=>{
        if(result){
            var con = {conversation_id:result[0].id,msg_read:0}
            var findNot = await conversationModel.selectMsgData(con);
            if(findNot.length>0){
                var where = {conversation_id : result[0].id}
                var dd = { msg_read:1,updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
                //update conversation table.
                await commonModel.updateData('pt_conversations',dd,where).then(async updtReadMsg=>{
                    if(updtReadMsg){
                        var notificationUpdate = updtNotify(customer_id,customer_id)
                    }
                }).catch(err=>{
                    res.json({status:false, message:'Message not updated.'});
                });
            }
            var cond = {conversation_id : result[0].id,updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
            //find all message data.
            await conversationModel.selectDataWithJoin(cond).then(async message=>{
                var messageArray = [];
                for await (let msg of message) {
                    messageArray.push({
                        ...msg,
                        date: moment(msg.createdAt).format('YYYY-MM-DD'),
                        createdDate: moment(msg.createdAt).format('h:mm A')
                    });
                }
                res.json({status:true,Data:messageArray});
            }).catch(err=>{
                res.json({status:false, message:'Message not found.'});
            });
        }else{
            res.json({status:false, message:'Ticket Not found.'});
        }
    }).catch(err=>{
        res.json({status:false, err : err});
    });
}

//function for get message notification. 
async function pt_unread_message(id,op_id){
    var where = {
        customer_id : id
    }
    var ct_id =await commonModel.selectData('id,updatedAt','pt_conversation_tickets',where);
    if(ct_id){
        var con = {
            conversation_id:ct_id[0].id,
            operator_id:op_id,
            msg_read:0
        }
        var findUnreadMessage = await conversationModel.countCustomerUnreadMsg(con);
        var condition={conversation_id:ct_id[0].id}
        var msgDate = await conversationModel.lastMsgDateTime(condition);
        var date = '';
        var msg = msg= findUnreadMessage[0].msg_read;
        if(msgDate.length>0){
            date = moment(msgDate[0].createdAt).format('YYYY-MM-DD HH:mm:ss');   
        }
        
        return {'msg':msg,'date':date};
    }
}

//update notification 
async function updtNotify(customer_id){
    var where = {customer_id:customer_id}
    var postData = {msg_read:1,updatedAt:moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
    updt = await commonModel.updateData('pt_notifications',postData,where);
    return updt;
}

//uses of socket.io for real time chat
io.on('connection', function(socket){
    console.log("User Connected")
    
    socket.on('send_message', function(data){ 
        socket.broadcast.emit('send_cust_message',{ message : data}); 
    });

    socket.on('send_operator', function(data){ 
        socket.broadcast.emit('send_operator_message',{ message : data}); 
    });

    socket.on('online',function(data){
        socket.broadcast.emit('customer_online',data);
    });

    socket.on('new_user',function(data){
        socket.broadcast.emit('new_customer',data);
    });

    socket.on('message', function(data){
        socket.broadcast.emit('new_message',{
            message : data
        });
    });

    socket.on('offline',function(data){
        socket.broadcast.emit('customer_offline',data);
    });
});

