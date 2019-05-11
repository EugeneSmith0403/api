import express from 'express'
import authentication from './../middleware/authentication'
import Trip from './../models/Trip'
import _ from 'lodash'

const router = express.Router()

const updateBooking = (response, tripId, updatedField, action) => {
  Trip.update({ _id: tripId }, updatedField )
    .then((result)=> {
        response.status(201).json({
          message: 'Driver ' + action +'s your trip'
        })
    })
    .catch((err)=>{
      response.status(500).json({
        message: err
      })
    })
}

router.get('/search', (req, res, next)=> {
  const {from, to} = req.body
  let filter = {}
  if(from && to) {
     filter = {from, to}
  }
  Trip.find(filter).populate('owner bookedPeople applyPeople cancelPeople').exec()
  .then((results)=> {
    res.status(200).json({
      results
    })
  }).catch((error)=>{
    res.status(500).json({
      results: {
        message: error
      }
    })
  })
})

router.get('/:id', (req, res, next)=> {
  const {id} = req.params
  Trip.findOne(id).populate('owner bookedPeople')
  .then((results)=>{
    res.status(200).json({
      results
    })
  })
})


router.post('/create', authentication, (req, res, next)=>{
  const {from, to, dateStart, dateFinished, maxPeople, occupiedPlaces, cost, carModel } = req.body
  const trip = new Trip({
    owner: req.userId,
    from,
    to,
    dateStart,
    dateFinished,
    maxPeople,
    occupiedPlaces,
    cost,
    carModel,
    bookedPeople: [],
    applyPeople: [],
    cancelPeople: []
  });

  trip
    .save()
    .then((results)=>{
    res.status(201).json({
      results
    })
  }).catch((error)=>{
    req.status(500).json({
      results: {
        message: error
      }
    })
  })

})


router.put('/update/:id', authentication, (req, res, next)=> {
  const {id} = req.params
  const filterParams = [];
  const body = req.body
  let updatedParams = {};
  _.forEach(body, (value, prop)=> {
      if(filterParams.indexOf(prop) !== -1) {
        updatedParams[prop] = value;
      }
  })
  Trip.findOneAndUpdate(
    { _id: id },
    { ...updatedParams, confirmed: true },
    { new: true }
  ).then((newRecord)=>{
    res.status(201).json({
      message: 'Trip updated',
      results: newRecord,
      type: 'POST'
    })
  }).catch((error)=>{
    req.status(500).json({
      results: {
        message: error
      }
    })
  })

})

router.delete('/delete/:id', (req, res, next)=>{
  const {id} = req.params.id
  Trip.remove({_id: id}).then((result)=>{
    res.status(200).json({
      results: 'Trip removed'
    })
  })
})


module.exports = router
