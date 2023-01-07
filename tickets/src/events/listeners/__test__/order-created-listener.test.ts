import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper' // natsWrapper singleton
import { OrderCreatedListener } from '../order-created-listener'
import { Ticket } from '../../../models/ticket'
import { OrderCreatedEvent, OrderStatus } from '@gittixticket/common'


const setup = async () => {
    // create an instance of the listener 
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create ans save a ticket 
    const ticket = Ticket.build({
        title: 'concert',
        price: 47,
        userId: 'jdjdj'
    
    })

    await ticket.save()

    //create the fake data onject 

    const data : OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(), // this is  the orderId
        status: OrderStatus.Created,
        userId: 'kdkdkd',
        version: 0,
        expiresAt: 'mdmjjdj',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
        
        }

        console.log(` function exacta ${data.id}`)

        // fake message object
        //@ts-ignore
        const msg: Message = {
            ack: jest.fn() 
        
        }

        return { listener, data, ticket, msg }


}

it('sets the userId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg)


    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id) 

});


it('acks the message', async () => {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()


});

it('publishes a ticket updated event ', async () => {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg) // aqui llamamos 

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    //@ts-ignore
    console.log(natsWrapper.client.publish.mock.calls) // la primera y unica invocacion de esta funcion por que en el setup para los test le puse jest.clearAllMocks() para cad  test independiente

    console.log(`data id:  ${data.id}`)
    
     const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock ).mock.calls[0][1]) //  que me trate la funcion publish como mock  ( igual el natsWrapper ya esta configurado para ser mock , osea esta utilizando el natsWrapper fake __mocks__ ),,,,it is a string so we have to parse it 
     console.log(`ticketUpdatedData orderId:  ${ticketUpdatedData.orderId}`)

     expect(data.id).toEqual(ticketUpdatedData.orderId)
     
})


