import nodemailer from "nodemailer";

const sendMail = async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    service: "gmail",
    secure: false, 

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <abc@gmail.com>', // sender address
    to: data.to, 
    subject: data.subject, 
    text: data.text, 
    html: data.html, 
  });

  console.log("Message sent: %s", info.messageId);
  console.log("preview URL:%s", nodemailer.getTestMessageUrl(info));
};

export { sendMail };
