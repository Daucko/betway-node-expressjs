const nodemailer = require('nodemailer');

const sendForgetPasswordEMail = async (
  email,
  message,
  subject = 'Reset Password'
) => {
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
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">${message}</div>`,
    };

    await mailTransport.sendMail(mailDetails);
  } catch (error) {
    console.log('Error sending email:', error);
    // Optionally, throw error to be handled by the caller
    throw error;
  }
};

module.exports = { sendForgetPasswordEMail };
