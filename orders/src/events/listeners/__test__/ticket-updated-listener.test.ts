import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { Message } from 'node-nats-streaming'
import { TicketUpdatedEvent } from '@gittixticket/common'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { Ticket } from '../../../models/ticket'


const setup = async () => {

    // create a listener 
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create an save a ticket 
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:58,
    })

    await ticket.save()

    // create a fake data object
    const data: TicketUpdatedEvent['data']  = {
        title: 'movie',
        price: 74,
        id: ticket.id,
        version: ticket.version + 1,
        userId: 'jdjjdjf'

    }

    // create a fake msg object
    //@ts-ignore 
    const msg: Message = {
        ack: jest.fn() // to mock the ack function

    }

    // return all of this stuff 

    return { listener, ticket, data, msg }

}



it('finds , updates and saves a ticket ', async () =>  {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg )

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)

})



it('it acks the message', async () =>  {
    const { data, listener, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()


})

it('does not call ack if the event has a skipped version number', async () => {
    const { listener, data, msg, ticket } = await setup()
        data.version = 10;

        try {
            await listener.onMessage(data, msg)
        
        } catch(err) {
            
        
        }

        expect(msg.ack).not.toHaveBeenCalled()

})