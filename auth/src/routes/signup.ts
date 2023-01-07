import express, {Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'
import { BadRequestError, validateRequest } from '@gittixticket/common' 

const router = express.Router()

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid')
        ,
    body('password')
        .trim() // sanitisasion step  , making sure there's no leading or trailing spaces on the password
        .isLength({ min: 4, max:20 })
        .withMessage('Password must be between 4 and 20 characters')
], 
validateRequest,  // middleware to catch the incoming request like email and password and throw an error

async (req: Request, res: Response) => {
   
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })

    if(existingUser){
       throw new BadRequestError('Email in use') // this error is catched by the errorHandler middleware 
    }

    const user = User.build({
        email: email,
        password: password
    
    })

    await user.save()

    // Generating jwt 
    const userJwt = jwt.sign({
        id: user._id,
        email: user.email
    
    }, process.env.MI_JWT! // to tell typescript that checked this variable when we start our app , and it is already defined 
    )

    // store it on the session object

    req.session = { // the cookie-session library will take this object serealizes it and send it back to the user browser
        jwt: userJwt

    }
   
    res.status(201).send(user)

});

// return res.status(400).send(errors.array()) // errors is an object , we are turning errors into an array
export { router as signupRouter }

