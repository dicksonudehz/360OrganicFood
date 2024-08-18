import nodemailer from "nodemailer";
// import asyncHandler from "express-async-handler";

const sendMail = async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      MAIL_ID: "dicksonudehz@gmail.com",
      pass: "E;FJu~SZ=h4ril21",
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <abc@gmail.com>', // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  console.log("preview URL:%s",nodemailer.getTestMessageUrl(info))
};

export { sendMail };
