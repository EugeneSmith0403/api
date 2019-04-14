import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

import User from './../models/User'

const router = express.Router()
const secret = process.env.SECRET

router.post('/auth',(req, res, next)=> {
  const {email, password} = req.body

  User.findOne({email})
    .then((user)=> {
      if(user) {
        user.generatePasswordHash(password)
        user.generateAccessToken();
        user.save().then((record)=>{
          if(record){
            res.json({
              results: {
                token: record.accessToken,
                email: record.email,
                username: record.username
              }
            })
          }
        }).catch()
      }
    })
    .catch()

})

router.post('/checkUser', (req, res, next) => {
    const {email} = req.body
    User.findOne({email}).then((record)=>{
      if(!record) {
        const user = new User({ email });
        user.generatePublicKey()
        user.save().then((savedRecord)=>{
            res.status(200).json({
              results: {
                key: savedRecord.publicKey
              }
            })
          }).catch((error)=> {
            res.status(500).json({error})
          })
      }else {
        res.status(500).json({
          errors: 'User existed!'
        })
      }
    })
    .catch((error)=> {
      res.status(500).json({
        error,
      })
    })
})


export default router
