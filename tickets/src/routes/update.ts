import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError } from '@gittixticket/common'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put('/api/tickets/:id',
requireAuth, 
[
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),

    body('price')
        .isFloat({ gt: 0})
        .withMessage('Price must be provided and must be greater than 0')

], validateRequest,
async (req: Request, res: Response) => {

    const ticket = await Ticket.findById(req.params.id)

    if(!ticket) {
        throw new NotFoundError()
    
    }

    if(ticket.orderId){ // preventing the user who owns this ticket can edit or make changes to this ticket, ( cause this ticket is reserved )
        throw new BadRequestError('cannot edit a reserved ticket')

    }

    if(ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError()

    }

    // if the user own the ticket
    ticket.set({
        title: req.body.title,
        price: req.body.price
    })

    // to persist to mongodb
    await ticket.save()

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })

    // i already got the updated version of this ticket , i do not have to refetch it
    res.send(ticket)
 
});



export { router as updateTicketRouter }