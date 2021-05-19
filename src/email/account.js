const sgMail = require("@sendgrid/mail");

try {
    //imposta APIKey
    sgMail.setApiKey(process.env.SG_MAIL_API_KEY);
} catch (e) {
    console.error(e);
}

/**
 * Invia email di benvenuto
 * @param {string} email
 * @param {string} name
 */
const sendWelcomeMail = (email, name) => {
    return sgMail.send({
        from: "prova@mail.com",
        to: email,
        subject: "Welcome",
        text: `Welcome ${name}`,
    });
};

/**
 * Invia email di cancellazione
 * @param {string} email
 * @param {string} name
 */
const sendCancelationMail = (email, name) => {
    return sgMail.send({
        from: "prova@mail.com",
        to: email,
        subject: "Goodbye",
        text: `Goodbye ${name}`,
    });
};

module.exports = {
    sendWelcomeMail,
    sendCancelationMail,
};
