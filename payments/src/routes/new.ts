import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, BadRequestError, validateRequest, NotFoundError, NotAuthorizedError ,OrderStatus} from '@gittixticket/common'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/payments',
 requireAuth, // make sure that the currentUser is defined
[
    body('token')
    .not()
    .isEmpty(),

    body('orderId')
    .not()
    .isEmpty()

],
validateRequest, // validateRequest se encargar de envia la respuesta de error back as a response del anterior middleware array validation
async (req: Request, res:Response) => {

    const { token , orderId } = req.body

    const order = await Order.findById(orderId)

    if(!order) { // there's no order with that id in the database
    
        throw new NotFoundError()
    }

    // the order tiene como referencia el userId ( la persona que hizo la orden )
    if(order.userId !== req.currentUser!.id) { // si el orderId.userId no es igual al currentUser.id ( el id del usuario que esta logiado)
        throw new NotAuthorizedError()
    
    }

    if(order.status === OrderStatus.Cancelled) { // the order is already cancelled
        throw new BadRequestError('cannot pay for an cancelled order')
    
    }


    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100, // converting into cents
        source: token

    })

    const payment =  Payment.build({
        orderId: orderId,
        stripeId: charge.id // stripe me devueleve el id de la orden pagada

    })

    await payment.save()

  /* await */ new PaymentCreatedPublisher(natsWrapper.client).publish({ // alternative use await
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    })


    res.status(201).send({ id : payment.id }) // todo make a test to the response



})

export { router as createChargeRouter }