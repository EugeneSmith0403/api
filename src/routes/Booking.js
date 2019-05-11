import express from 'express'
import authentication from './../middleware/authentication'
import Trip from './../models/Trip'
import _ from 'lodash'

const router = express.Router()

router.put('/apply', authentication, (req, res, next)=> {
  const action = 'apply'
  const tripId = req.body
  const userId = req.userId
  const updatedField = {
    $pull: { bookedPeople: { $in: [ userId ]}, cancelPassengers: { $in: [ userId ]} },
    $set: { applyPassengers: userId }
  }
  updateBooking(res, tripId, updatedField, action)
})

router.put('/cancel', authentication, (req, res, next)=> {
  const action = 'cancel'
  const id = req.body
  const userId = req.userId
  const updatedField = {
    $pull: { pendingPassengers: { $in: [ userId ]}, applyPassengers: { $in: [ userId ]} },
    $set: { cancelPassengers: userId }
  }
  updateBooking(res, id, updatedField, action)
})

router.put('/pending', authentication, (req, res,next)=>{
  const action = 'pending'
  const id = req.body
  const updatedField = { $set: { bookedPeople: req.currentUser }}
  updateBooking(res, id, updatedField, action)

})
module.exports = router
