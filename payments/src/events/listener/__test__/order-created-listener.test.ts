import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { OrderCreatedEvent, OrderStatus } from '@gittixticket/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from "../../../models/order"

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);


    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: 'kfkkf',
        userId: 'kdjjd',
        status: OrderStatus.Created,
        ticket: {
            id: 'kdkdk',
            price: 12
        
        }
    }

    // @ts-ignore // ts-ignore para que no me salga error en el tipo msg , por que no cumple con las otras propiedades de tipo Message trae
    const msg: Message = {
        ack: jest.fn()

    }

    return { listener, data, msg }


}

it('replicates the order info', async () =>  {
     const { listener, data, msg } = await setup()
    
     await listener.onMessage(data, msg)

     const order = await Order.findById(data.id)


     expect(order!.price).toEqual(data.ticket.price)

});



it('acks the message', async () =>  {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()

});