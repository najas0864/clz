import { createTransport } from "nodemailer";

export const getOtp = async (email,otp)=> {
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
  try {
    const info =await transporter.sendMail({
      from: 'najas0864@gmail.com',
      to: email,
      subject: `${(otp==false)?"Greetings new member":"OTP Verification"}`,
      html: (otp==false)?
      `<h1>Welcome to our platform!</h1>
      <img src="https://media.istockphoto.com/id/1147544802/vector/welcome-word-with-colorful-confetti-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=YJYk1Z5lXo3nfXo0pS6u6b9VJSu5K6h8H3U5Y1RzvXU=" alt="Welcome" width="400" height="300"/>
      <p>We're excited to have you join us.</p>
      <p>please stay connected for further updates.</p>
      `
      :
      `<h1>Your OTP is: ${otp}</h1>
      <img src="https://media.istockphoto.com/id/1147544802/vector/welcome-word-with-colorful-confetti-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=YJYk1Z5lXo3nfXo0pS6u6b9VJSu5K6h8H3U5Y1RzvXU=" alt="Welcome" width="400" height="300"/>
      <p>If you have not requested the otp please delete this email.</p>
      `,
    });
    return { success: true };
  } catch (error) {return {success: false,message: error.message}}
}