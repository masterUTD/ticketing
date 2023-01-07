import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get('/api/tickets', async (req: Request, res: Response) => {
    const tickets = await Ticket.find({ // solo me da los tickets que estan disponibles
        orderId: undefined
    
    })


    res.send(tickets)
});



export { router as indexTicketRouter }