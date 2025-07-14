const nodemailer = require('nodemailer');
const settings = require('./settings.json');

async function sendMail(email, password)
{ 
      var smtpTransport = nodemailer.createTransport({
		service: settings.SMTP_SERVICE,
		host: settings.SMTP_HOST,
            port: settings.SMTP_PORT,
            secure: true,
		auth: {
			user: settings.EMAIL_FROM,
			pass: settings.EMAIL_PASS
		}
      });  

      var htmlbody = '<p>You are added as a <b>Operator</b> in <b>PixelTalk</b> by admin.<p>'
      +'<p>Click <a href="'+settings.Basic_URL+'">here</a> to Login in PixelTalk.</p>'
      +'<p> Your credentials are - <p><b>Email : '+email+'</b><br><b> Password : '+password+'</b>'

      var mailOptions={
            from: settings.EMAIL_FROM,
            to : email,
            subject : settings.SUBJECT,
            text : '',
            html: htmlbody
      }
      
      var info = await smtpTransport.sendMail(mailOptions);
      smtpTransport.close();
      return info;

}

module.exports = sendMail;