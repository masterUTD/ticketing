import express, { Request, Response } from 'express'
import { requireAuth } from '@gittixticket/common'
import { Order } from '../models/order'

const router = express.Router()

router.get('/api/orders',
requireAuth, async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id}).populate('ticket') // populate the values of the key ticket

    res.send(orders)

});

export { router as indexOrderRouter }

