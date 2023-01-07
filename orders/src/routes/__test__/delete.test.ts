import mongoose from 'mongoose'
import request from 'supertest';
import { app } from '../../app'

import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'

import { natsWrapper } from '../../nats-wrapper' // redirecting to the fake natsWrapper ( mock )

it('marks an order as candelled', async () => {
    // create a ticket with ticket order
        const ticket = Ticket.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            title: 'Concert',
            price: 25
        })
    
        await ticket.save()
        const user = global.signin()
    // make a request to create an order 
       const { body: order } =  await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id})
            .expect(201)

    // make a request to cancel the order 
         await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', user)
            .send()
            .expect(204)


    // expectation to make sure the thing  is cancelled 
    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)

});


it('emits an order cancelled event ', async () => {

    // create a ticket with ticket order
        const ticket = Ticket.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            title: 'Concert',
            price: 25
        })
    
        await ticket.save()
        const user = global.signin()
    // make a request to create an order 
       const { body: order } =  await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id})
            .expect(201)

    // make a request to cancel the order 
        await request(app)
            .delete(`/api/orders/${order.id}`) //delete do not really remove it from database , just change the status from created to cancelled
            .set('Cookie', user)
            .send()
            .expect(204)

    // publish the delete event
    expect(natsWrapper.client.publish).toHaveBeenCalled() // .not.toHaveBeenCalled
});