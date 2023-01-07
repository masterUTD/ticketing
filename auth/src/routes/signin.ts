import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { User } from '../models/user'
import { validateRequest, BadRequestError } from '@gittixticket/common'
import { Password } from '../services/password'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/api/users/signin', [
    body('email')
      .isEmail()
      .withMessage(' Email must be vaalid'),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password')

],
validateRequest,

async (req: Request, res: Response) => {
 
  const { email, password } = req.body

  const existingUser = await User.findOne({ email})
  
  if(!existingUser) {
    throw new BadRequestError('Invalid credentials')

  }

  const passwordsMatch = await  Password.compare(existingUser.password, password)
  //passwordsMatch is going to be a boolean

  if(!passwordsMatch) {

    throw new BadRequestError('Invalid credentials')
  }


      // Generating jwt 
      const userJwt = jwt.sign({
        id: existingUser._id,
        email: existingUser.email
    
    }, process.env.MI_JWT! // to tell typescript that checked this variable when we start our app , and it is already defined 
    )

    // store it on the session object

    req.session = { // the cookie-session library will take this object serializes it and send it back to the user browser
        jwt: userJwt

    }
   
    res.status(200).send(existingUser)



  

});


export { router as signinRouter }

