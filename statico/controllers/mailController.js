import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
})

async function sendMail(from, to, subject, text, html){
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from,       // sender address: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
        to,         // list of receivers: "bar@example.com, baz@example.com", 
        subject,    // Subject line: "Hello ✔",
        text,       // plain text body: "Hello world?",
        html        // html body: "<b>Hello world?</b>",
    });

    console.log("Message sent: %s", info.messageId);
}

export function sendVerificationMailMiddleware(req, res, next){
    if(req.sendVerificationMail === true){
        //  Get user data
        let {email, username} = req.body
        const verificationToken = req.verificationToken
        const host = req.host
        sendVerificationMail(email, username, host, verificationToken)
    }
    next()
}

// export function sendVerificationMail(req, res, next){
export function sendVerificationMail(email, username, host, verificationToken){
    const from = '"Statico Admin" <admin@statico.com>'
    const to = email
    const subject = "Statico Email verification"
    const text = `Hello ${username}
                You registered an account on Statico, before being able to use your account you need to verify that this is your email address here: ${host}/verify/${verificationToken}
                Kind Regards, Statico`
    const html = `Hello ${username}
    You registered an account on Statico, before being able to use your account you need to verify that this is your email address by clicking <a href="${host}/verify/${verificationToken}">here</a>
    Kind Regards, Statico`

    sendMail(from, to, subject, text, html)
}