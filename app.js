require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const user = require('./models/user')
const bcrypt = require('bcrypt')
mongoose.connect('mongodb://localhost:27017/loginApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,useFindAndModify:false });


app.use(express.static('public'))

app.use(bodyParser.json());

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/static/index.html')
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/static/login.html')
})
app.get('/changePassword', (req, res) => {
    res.sendFile(__dirname + '/static/changePassword.html')
})



app.post('/api/changePassword', (req, res) => {
    // console.log(req.body);
    const { newPassword, token } = req.body;

    try {
        const verify = jwt.verify(token, process.env.SECRET)

        console.log(verify);
        bcrypt.hash(newPassword, 10, (err, hash) => {
            console.log(hash);

            // save new password

            user.findOneAndUpdate({ email: verify.email }, { password: hash }, async (err, result) => {
                if (err) throw err
                else {
                    console.log(" Previous Updated INFO "+result);
                    res.json({
                        status:"Ok"
                    })
                }
            })

        })



    }
    catch {
        return res.json({
            error: "User authentication failed"
        })
    }




})





app.post('/api/login', async (req, res) => {
    const { email, password } = req.body
    console.log('login');
    console.log(req.body);
    if (!email || !password) {
        return res.status(402).json({
            error: "Please enter all fields"
        })
    }

    await user.findOne({ email: email }, (err, result) => {

        // console.log(result,err);
        if (!result) {
            return res.json({ error: "Username already exists" })
        }

        bcrypt.compare(password, result.password, (err, check) => {
            // if password doesn't match ---

            if (!check) {
                return res.json({ error: "Password is incorrect" })
            }
            // logged in---

            else {
                console.log(process.env.SECRET);
                const token = jwt.sign({
                    _id: 1,
                    email: email
                }, process.env.SECRET)
                return res.json({ status: "User Successfully LoggedIn", data: token })
            }
        })

    })



    // return res.json({
    // status:"ok",
    // data:"coming soon"
    // })






})

app.post('/api/register', async (req, res) => {

    console.log(req.body);
    const { email, password } = req.body

    if (!email || !password) {
        return res.status().json({
            error: "Please enter all fields"
        })
    }

    bcrypt.hash(password, 10, (err, hash) => {


        if (!err) {
            console.log(hash);


            const users = new user({
                email,
                password: hash
            })
            users.save((err, result) => {
                if (err) {
                    // console.log("error: " + err.code);
                    if (err.code === 11000) {

                        // solving duplicate error---
                        return res.status(409).json({
                            error: "Username already exists"
                        })
                    }

                }
                else {
                    // saved 
                    return res.status(200).json({
                        error: "User Saved Sucessfully !!!"
                    })
                    // console.log("User Saved Sucessfully !!!");
                }
            })






        }
    })






})


app.listen(3000, () => {
    console.log("Server started at PORT 3000");
})