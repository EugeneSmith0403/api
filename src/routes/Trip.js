import express from "express";
import authentication from "./../middleware/authentication";
import Trip from "./../models/Trip";
import _ from "lodash";
const mongoose = require("mongoose");

const router = express.Router();

const updateBooking = (response, tripId, updatedField, action) => {
  Trip.update(
    {
      _id: tripId
    },
    updatedField
  )
    .then(result => {
      response.status(201).json({
        message: "Driver " + action + "s your trip"
      });
    })
    .catch(err => {
      response.status(500).json({
        message: err
      });
    });
};

router.get("/search", (req, res, next) => {
  const { from, to, email } = req.query;
  let filter = {};
  if (from && to) {
    filter = {
      "from.lat": from.split(",")[0],
      "from.lng": from.split(",")[1],
      "to.lat": to.split(",")[0],
      "to.lng": to.split(",")[1]
    };
  }
  let populateFilter = {
    path: 'owner',
    select: 'image username phone age email',
  }
  if(email) {
    populateFilter['match'] = {
      email
    }
  }
  Trip.find(filter)
    .populate(populateFilter)
    .exec()
    .then(results => {
      res.status(200).json({
        results: results.filter((item)=> {
          return !!item.owner
        })
      });
    })
    .catch(error => {
      res.status(500).json({
        results: {
          message: error
        }
      });
    });
});

router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  Trip.findOne(id)
    .populate("owner", "image username phone age email")
    .then(results => {
      res.status(200).json({
        results
      });
    })
    .catch(error => {
      res.status(500).json({
        results: {
          message: error
        }
      });
    });
});

router.post("/create", authentication, (req, res, next) => {
  const {
    from,
    to,
    dateStart,
    dateFinished,
    maxPlaces,
    occupiedPlaces,
    cost,
    carModel
  } = req.body;
  const trip = new Trip({
    _id: new mongoose.Types.ObjectId(),
    owner: req.userId,
    from,
    to,
    dateStart,
    dateFinished,
    maxPlaces,
    occupiedPlaces,
    cost,
    carModel,
    bookedPeople: [],
    applyPeople: [],
    cancelPeople: []
  });

  trip
    .save()
    .then(results => {
      res.status(201).json({
        results
      });
    })
    .catch(error => {
      res.status(500).json({
        results: {
          message: error
        }
      });
    });
});

router.put("/update/:id", /*authentication,*/ (req, res, next) => {
  const { id } = req.params;
  const filterParams = [];
  const body = req.body;
  let updatedParams = {};
  _.forEach(body, (value, prop) => {
  //  if (filterParams.indexOf(prop) !== -1) {
      if(prop !== 'updated') {
        updatedParams[prop] = value;
      }
//    }
  });
  Trip.findOneAndUpdate(
    {
      _id: id
    },
    {
      ...updatedParams,
      confirmed: true
    },
    {
      new: true
    }
  ).populate("owner", "image username phone age email")
    .then(newRecord => {
      res.status(201).json({
        message: "Trip updated",
        results: newRecord,
        type: "POST"
      });
    })
    .catch(error => {
      req.status(500).json({
        results: {
          message: error
        }
      });
    });
});

router.delete("/delete/:id", (req, res, next) => {
  const delId = req.params.id;
  Trip.remove({
    _id: delId
  }).then(result => {
    res.status(200).json({
      results: {
        message:"Trip removed",
        id: delId
      },
    });
  }).catch(error => {
    req.status(500).json({
      results: {
        message: error
      }
    });
  });
});

module.exports = router;
