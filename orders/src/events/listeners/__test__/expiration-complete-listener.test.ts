import { ExpirationCompleteListener } from '../expiration-complete-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderStatus, ExpirationCompleteEvent } from '@gittixticket/common'
import { natsWrapper  } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { Order } from '../../../models/order'



const setup = async () =>  {

    // create a instace of the listener 
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'movie',
        price: 78
    
    })

    await ticket.save()

    const order = Order.build({
        status: OrderStatus.Created,
        userId:'jdjjdjd',
        expiresAt: new Date(),
        ticket: ticket

    })

    await order.save()

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id

    }

    //@ts-ignore

    const msg: Message = {
    
        ack: jest.fn()
    }

    return { listener, order , ticket, data, msg}

}

it('updates the order status to cancelled', async () => {

    const { listener, order, data, msg } = await setup()

    await listener.onMessage(data, msg) // aqui me cambia el estado a cancelled


    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)

})

it('emits an  ordercancelled event', async () => {
    
    const { listener, order, data, msg } = await setup();

     await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse(( natsWrapper.client.publish as jest.Mock).mock.calls[0][1]) // [0] the first time the function was called //[1] the first argument is the subject or the channel name // the second argument  gives me the actual data 

    // para que me trate natsWrapper client publish como mock
    expect(eventData.id).toEqual(order.id)

})


it('acks the message', async () => {
    
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()


})
