import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledEvent, OrderStatus } from '@gittixticket/common'
import { natsWrapper } from '../../../nats-wrapper' // natsWrapper singleton
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Ticket } from '../../../models/ticket'


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)
    
    const orderId = new mongoose.Types.ObjectId().toHexString()

    const ticket = Ticket.build({
        title: 'concert',
        price: 89,
        userId: 'mjd'
    
    })

    ticket.set({ orderId })

    await ticket.save()

    const data: OrderCancelledEvent['data'] =  {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        
        }

    }

    //@ts-ignore
    const msg : Message = {
        ack: jest.fn() // mocking the ack function  // fingiendo que la funcion ack fue ejecutada satisfactoriamente
    
    }

    return { listener, ticket, msg, data, orderId }
     

}

it('updates the ticket, publishes an event, and acks the message ', async () => {
    const { listener, data, ticket, msg, orderId } = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).not.toBeDefined() // despues que se ejecuta la funcion listener.onMessage ,, el orderId debe ser undefined
    expect(msg.ack).toHaveBeenCalled() 
    expect(natsWrapper.client.publish).toHaveBeenCalled()

})