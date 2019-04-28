import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import confirmUserEntrance from './../helpers/mailer'
import validMailToken from './../middleware/validMailToken'
import authentication from './../middleware/authentication'
import User from './../models/User'

const router = express.Router()
const secret = process.env.SECRET


const processingUserEntrance = (userModel, result) => {
  userModel.generateRefreshToken()
  userModel.generateAccessToken()
  userModel.save()
    .then((savedRecord)=>{
      if(savedRecord) {
        result.status(200).json({
            results: {
              user: {
                accessToken: savedRecord.accessToken,
                refreshToken: savedRecord.refreshToken,
                username: savedRecord.username,
                email: savedRecord.email
            }
          }
        })
      }
  }).catch((error)=>{
    result.status(500).json({
      error: 'somethings wron, try again'
    })
  })
}

/*проверка пользователя перед регистраций на существования если все ок
то отправляем пользователю секретный ключ с помощью которого он шефрует свой пароль затем клиент дергает метод signup*/

router.post('/checkUserSignUp', (req, res, next) => {
    const {email} = req.body
    User.findOne({email}).then((record)=>{
      if(!record) {
        const user = new User({email})
        user.generatePublicKey()
        user.passwordHash = bcrypt.hashSync(Math.random().toString(), 10);
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
          results: {
            errors:  {
              message: 'User existed!'
            }
          }
        })
      }
    })
    .catch((error)=> {
      res.status(500).json({
        error,
      })
    })
})


/*
  после checkUser вызывается sign up в
  котором я принимаю хеш пароля зашифрованный c помощью publicKey от клиента
  затем еще раз шифрую и пишу в базу после сохранения
  я отправляю ссылку на имэил пользователю для подтверждения личности


*/
router.post('/signup',(req, res, next)=> {
  const {email, password} = req.body

  User.findOne({email})
    .then((user)=> {
      if(user) {
        user.generatePasswordHash(password)
        user.generateMailToken()
      //  user.generateAccessToken()
        user.save().then((record)=>{
          if(record){
            confirmUserEntrance(record.email, record.mailToken)
            res.json({
              results: {
                publicKey: record.publicKey
              }
            })
          }
        }).catch()
      }
    })
    .catch()

})

/*
проверяю валидность mailToken и ищу пользователя с текущем имейлом
взяв его из токена
если все хорошо то отдаю пользователю accessToken и refreshToken пользователь
залогинился автоматически
*/
router.post('/confirmEntranceSignup', validMailToken, (req, res, next) => {
  const { email } = req;
  User.findOne({ email })
    .then((user)=> {
        user.confirmed = true;
        processingUserEntrance(user, res)
    })
})

//возвращаю информацию текущего юзера
router.post('/fetchCurrentUser', authentication, (req, res, next)=> {
  const {email} = req.currentUser
  User.findOne({ email }).then((user)=>{
    if(user) {
      res.status(200).json({
        results: {
          user: req.currentUser
        }
      })
    }
  })
})


/* Проверяю существование Юзера перед login если все ок то возвращаю publicKey для шифрования пароля*/
router.post('/checkUserLogin', (req, res, next) => {
    const {email} = req.body
    User.findOne({email}).then((record)=>{
      if(record) {
        const user = new User({ email });
        res.status(200).json({
          results: {
            key: record.publicKey
          }
        })
      }else {
        res.status(500).json({
          errors: "User doesn't exist!"
        })
      }
    })
    .catch((error)=> {
      res.status(500).json({
        error,
      })
    })
})


/*
Проверяю пароль у пользователя который логинется и отдаю токены
*/
router.post('/login', (req, res, next)=> {
  const {password, email} = req.body


  User.findOne({email}).then((user)=> {
    const text = User.decodePassword(password, user.publicKey)
    bcrypt.compare(text, user.passwordHash, function(err, result) {
        if(result) {
          processingUserEntrance(user, res)
          }else {
            res.status(500).json({
              results: {
                errors: {
                  message: 'Invalid password'
                }
              }
            })
          }
    });

  }).catch((err)=>{
    res.status(500).json({
      results: {
        errors: {
          message: 'somethings wrong'
        }
      }
    })
  })

})

router.post('/logout', (req, res, next)=> {
  const {accessToken} = req.body
  User.findOne({accessToken})
    .then((userModel)=>{
      console.log(userModel)
      userModel.generateAccessToken()
      userModel.generateRefreshToken()
      res.status(200).json({
        results: {}
      })
    })
    .catch((error)=>{
      res.status(500).json({
        results: {
          message: 'somethings wrong, try again'
        }
      })
    })
})

router.post('/resetPassword', (req, res, next)=> {})



export default router
