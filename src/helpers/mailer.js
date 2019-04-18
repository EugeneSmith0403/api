import nodemailer  from "nodemailer"



function setup() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

export default function confirmUserEntrance (email, hash) {
  const transporter = setup()
  transporter.sendMail({
    from: 'bla bla services confirmation email',
    to: email,
    subject: "Confirmation entrance",
    text: `Hello, Please use this link ${process.env.HOST + '/confirmEntrance/' + hash} to enter on the website`,
  });
}
