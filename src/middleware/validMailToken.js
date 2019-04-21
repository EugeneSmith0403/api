import jwt from 'jsonwebtoken'
import User from './../models/User'


export default (req, res, next) => {
    const {mailToken} = req.body
    jwt.verify(mailToken, process.env.JWT_SECRET, (err, decode)=> {
      if(!err ) {
        req.email = decode.email
        next()
      }else {
        if(decode && decode['email']) {
          User.remove({email:decode.email}).exec().then((user)=>{
            res.status(401).json({
              results: {
                errors: {
                  message: 'Unauthorized. Invalid token, please signup again'
                }
              }
            })
          })
        }else {
          res.status(500).json({
            results: {
              errors: {
                message: 'Somethings wrong'
              }
            }
          })
        }
      }
    })

}
