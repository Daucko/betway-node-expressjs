const nodemailer = require('nodemailer');

const sendForgetPasswordEMail = async (email, token) => {
  try {
    const mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.EMAIL_PASSWORD}`,
      },
    });
    const mailDetails = {
      from: `${process.env.EMAIL}`,
      to: `${email}`,
      subject: 'Reset Password',
      html: `<h1 style="color: #2563eb;">Here is the token to reset you password please click on the button,
          
          <a  href='https://www.yourcareerex.com/reset-password/${token}'>Reset Password </a>

          if the button does not work for any reason, please click the link below

           <a href='https://www.yourcareerex.com/reset-password/${token}'>Reset Password </a>
          ${token}
          
          </h1>`,
    };

    await mailTransport.sendMail(mailDetails);
  } catch (error) {
    console.log('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};

module.exports = { sendForgetPasswordEMail };
