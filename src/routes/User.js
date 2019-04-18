import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import confirmUserEntrance from './../helpers/mailer'
import validConfirmToken from './../middleware/validConfirmToken'
import authentication from './../middleware/authentication'
import User from './../models/User'

const router = express.Router()
const secret = process.env.SECRET


const processingUserEntrance = (userModel) {
  userModel.generateRefreshToken()
  userModel.generateAccessToken()
  userModel.save()
    .then((savedRecord)=>{
      if(userRecord) {
        res.status(200).json({
          results: {
            accessToken: savedRecord.accessToken,
            refreshToken: savedRecord.refreshToken,
            username: savedRecord.username,
            email: savedRecord.email
          }
        })
      }
  }).catch((error)=>{
    res.status(500).json({
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
        record.generatePublicKey()
        record.save().then((savedRecord)=>{
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
router.post('/confirmEntranceSignup', validConfirmToken, (req, res, next) => {
  const { email } = req;
  User.findOne({ email })
    .then((user)=> {
        user.generateRefreshToken()
        user.generateAccessToken()
      user.save()
        .then((savedRecord)=>{
          if(userRecord) {
            res.status(200).json({
              results: {
                accessToken: savedRecord.accessToken,
                refreshToken: savedRecord.refreshToken,
                username: savedRecord.username,
                email: savedRecord.email
              }
            })
          }
      }).catch((error)=>{
        res.status(500).json({
          error: 'somethings wron, try again'
        })
      })
    })
})

//authentification
router.post('/fetchCurrentUser', validConfirmToken, (req, res, next)=> {
  const {email} = req.body
  User.findOne({ email}).then((user)=>{
    if(user) {
      res.status(200).json({
        results: {
          user
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
          errors: "User doesn't existed!"
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
  User.find({email}).then((user)=> {
    bcrypt.compare(user.passwordHash, password, function(err, result) {
        if(!err) {
          /*TODO дубль*/
          user.generateAccessToken()
          user.generateRefreshToken()
          user.save().then((savedRecord)=>{
            res.status(200).json({
              results: {
                accessToken: savedRecord.accessToken,
                refreshToken: savedRecord.refreshToken,
                email: savedRecord.email,
                name: savedRecord.name
              }
          })

          })else {
            res.status(500).json({
              results: {
                errors: {
                  'Invalid password'
                }
              }
            })
          }
        }
    });

  }).catch((err)=>{
    res.status(500).json({
      results: {
        errors: {
          'somethings wrong'
        }
      }
    })
  })

})

router.post('/logout', (req, res, next)=> {})

router.post('/resetPassword', (req, res, next)=> {})
router.post('/currentUser', authentication,  (req, res, next)=> {
  const userData = {
    token: user.accessToken,
    email: user.email,
    name: user.name
  }
  res.status(200).json({
    results: {
      accessToken:
      ...userData
    }
  })
})


export default router
