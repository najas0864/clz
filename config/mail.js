import { createTransport } from "nodemailer";

export const getOtp = async (email,otp)=> {
  try {
    const transporter = createTransport({
        host:'smtp.gmail.com',
        service: 'gmail',
        port:465,
        secure:true,
        tls:{
          servername:'smtp.gmail.com',
          rejectUnauthorized: true,
        },
        auth: {
          user: 'najas0864@gmail.com',
          pass: 'bnij gkvk ahiq rzwi',
        },
    });
    await transporter.sendMail({
      from: 'najas0864@gmail.com',
      to: email,
      subject: 'OTP Verification',
      html: `
        <h1>Your OTP is: ${otp}</h1>
        <p>If you have not requested the otp please delete this email.</p>
      `,
    });
    console.log(`Email sent to :${email} `);
  } catch (error) {
      console.log(`error sending email to ${email}: ${error.message}`);
  }
}