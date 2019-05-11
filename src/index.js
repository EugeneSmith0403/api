import express from 'express'

import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import dotenv from "dotenv"
import user from './routes/User'
import trip from './routes/Trip'
import booking from './routes/Booking'

dotenv.config()


const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('uploads'))

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*')
  res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if(req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }
  next()
});

mongoose.connect(process.env.MONGODB_URL,  {useNewUrlParser: true, useCreateIndex: true });


app.use('/api', user)
app.use('/api/trip', trip)
app.use('/api/book', booking)


app.listen(8080, () => console.log("Running on localhost:8080"));
