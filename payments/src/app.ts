import express, { Request, Response} from 'express';
import  'express-async-errors' // change the behavior on how express handles errors on async errors , make sure express wait or watch it
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@gittixticket/common' // comes from my public npm organization package that i created to share code bettween services
import { createChargeRouter } from './routes/new'


const app = express();
app.set('trust proxy', true) // to trust on the traffic that is being proxied through ingress nginx , so we are telling express to trust on that traffic, to trust https connection


//trust proxy is for use cookie-session https  properly
app.use(express.json());
app.use(cookieSession({
    signed: false, // This signature key is used to detect tampering the next time a cookie is received.
    secure: process.env.NODE_ENV !== 'test'//in test, (jest) NODE.ENV variable will be named test, that means false , but in development or production will be true    // just send headers cookies for https requests if true

}))

app.use(currentUser) // current user middle ware to get the current user and pu it in tha req.currentUser creo
app.use(createChargeRouter)

app.all('*', async (req, res) => { // for not found routes, .all for post and get,  make sure express wait or watch for any errors that we throw at any point in time inside this function

    throw new NotFoundError() // when i throw this error express is gonna catch the error in the below middleware
});

app.use(errorHandler); // cath all the errors

export { app }