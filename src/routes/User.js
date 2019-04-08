import express from 'express'

import User from './../models/User'

const router = express.Router()


router.post('/auth',(req, res, next)=> {
  console.log('work')
})

export default router
