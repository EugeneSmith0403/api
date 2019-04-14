import express from 'express'

import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import dotenv from "dotenv"
import user from './routes/User'

dotenv.config()


const app = express()
app.use(bodyParser.json())

mongoose.connect(process.env.MONGODB_URL,  {useNewUrlParser: true, useCreateIndex: true });


app.use('/api', user)


app.listen(8080, () => console.log("Running on localhost:8080"));
