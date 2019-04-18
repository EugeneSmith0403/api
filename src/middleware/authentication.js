import jwt from 'jsonwebtoken'
import User from './../models/User'


export default (req,res, next) => {
  const {token} = req.body
  const hash = token.split(' ')[1]
  jwt.verify(hash, process.env.JWT_SECRET, (err, decode)=> {
    if(!err) {
      User.findOne({accessToken: hash}).then((user)=>{
          req.currentUser = user;
          next()
      })
      .catch(e=>e.response.data);

    }else {
      res.status(500).json({

      })
    }
  })

}
