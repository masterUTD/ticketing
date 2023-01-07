import express, { Response, Request, NextFunction } from 'express';
import { requireAuth, validateRequest } from '@gittixticket/common'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()


router.post('/api/tickets', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('title is required'),

    body('price')
        .isFloat({ gt: 0 }) // or possibly has a decimal greater than 0 
        .withMessage('price must be greater than 0')

], validateRequest,
async (req: Request, res: Response) => {
    const { title, price } = req.body

   const ticket =  Ticket.build({
      title,
      price,  
      userId: req.currentUser!.id // to tell typescript to not worry about it , i already took care about it
    })

    await ticket.save()

    await new TicketCreatedPublisher(natsWrapper.client).publish({ // publish to nats streaming server this information 
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    }); 

    res.status(201).send(ticket)
})

export  { router as createTicketRouter}