import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { TicketCreatedEvent } from './ticket-created-event'
import { Subjects } from './subjects'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> { // la implementacion del parametro T
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated // TicketCreatedEvent['subject'] the same ,, just enum work in running time
    queueGroupName = 'payments-service';
    // subject: TicketCreatedEvent['subject'] = Subjects.TicketCreated  // also correctly , the interface does not work to  assign values like this case we have to use an enum to assing the value

    onMessage(data: TicketCreatedEvent['data'], msg: Message) { // implementando corectamente utilizando el parametro T (TicketCreatedEvent ) , overwritting data  de any para object creo
        console.log('Event data', data)
        
        msg.ack()
    }

};