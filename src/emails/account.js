const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_KEY);

const welcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'task@manage.io',
    subject: 'Thank you for signing up',
    text: `Hello ${name}, welcome to the task manager family`
  });
};
const cancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'task@manage.io',
    subject: 'Sad to see you go ):',
    text: `Hello ${name}, we hope to see you come back soon`
  });
};

module.exports = { welcomeEmail, cancelEmail };
