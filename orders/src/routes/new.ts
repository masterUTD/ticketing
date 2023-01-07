import express, { Request, Response } from 'express'
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@gittixticket/common' 
import { body } from 'express-validator'
import mongoose from 'mongoose'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'


const router = express.Router()

// const EXPIRATION_WINDOW_SECONDS = 15 * 60; // to expire in 15 minutes
const EXPIRATION_WINDOW_SECONDS = 1 * 60; // to expire in minute

router.post('/api/orders', requireAuth, // req.currentUser.id
[
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) // custom validation , to make sure is a valid mongoose id
        .withMessage('ticket id must be provided')

], validateRequest,
     async (req: Request, res: Response) => { // validateRequest es el que envia the rejection del la validacion del middleware anterior
    
    const { ticketId } = req.body
    // find the ticket the user is trying to order in the database
    const ticket =  await Ticket.findById( ticketId )

    if(!ticket) {
        // throw new BadRequestError('Ticket is already reserved')
        throw new NotFoundError()
    
    }

    // make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved()

    if(isReserved) {
        throw new BadRequestError('Ticket is already reserved')
    
    }


    // calculate an expiration date for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS) 
    
    // build the order and save it to the database
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created, // the initial status 
        expiresAt: expiration,
        ticket: ticket,
    })

    await order.save()

    // publish an event saying that a order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        version: order.version,
        expiresAt: order.expiresAt.toISOString(),  // to get a utc timestamp
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })

    res.status(201).send(order)

});

export { router as newOrderRouter }

