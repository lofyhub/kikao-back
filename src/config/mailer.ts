import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: 'nova.roob@ethereal.email',
        pass: 'GFnT2t9xjjw9Vc692e'
    }
});

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(name: string) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Kikao Team 👻" <philo7029@gmail.com>', // sender address
        to: 'philo7029@gmail.com', // list of receivers
        subject: `Welcome to Kikao, ${name}!`, // Subject line
        html: sentEmail(name) // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

const sentEmail = (name: string): string => {
    const email = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kikao</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #4CAF50;
    }
    p {
      font-size: 16px;
    }
    .cta-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
    .footer a {
      color: #777;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Kikao, ${name}!</h1>
    <p>Thank you for signing up with Kikao! We're excited to have you on board.</p>
    <p>To get started, feel free to explore all the features we offer. If you ever have any questions, our team is always here to help.</p>
    <p>For more details about our platform, take a look at the following links:</p>
    <ul>
      <li><a href="[About Us Link]">About Us</a></li>
      <li><a href="[Privacy Policy Link]">Privacy Policy</a></li>
      <li><a href="[Terms of Service Link]">Terms of Service</a></li>
    </ul>
    <p>We're glad you're here and can't wait for you to enjoy everything we have to offer!</p>
    <p>Best regards,<br>The Kikao Team</p>
    <div class="footer">
      <p>If you did not sign up for Kikao, please disregard this email.</p>
    </div>
  </div>
</body>
</html>`;

    return email;
};
