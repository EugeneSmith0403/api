import jwt from 'jsonwebtoken'
import User from './../models/User'


export default (req, res, next) => {
    const {token} = req.body
    jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
      if(!err) {
        req.email = decode.email
        next()
      }else {
        User.remove({email:decode.email}).exec().then((user)=>{
          res.status(500).json({
            errors: 'invalid token, please signup again'
          })
        }).catch(res=>res)
      }
    })

}
