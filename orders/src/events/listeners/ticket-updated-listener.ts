import { Message } from 'node-nats-streaming'
import { Listener, Subjects, TicketUpdatedEvent } from '@gittixticket/common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> { // Listener is a generic class so we have to provide the type
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

   async  onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data) // solo puede procesar eventos con la version anterior a esta , ejemplo esta version es la 3, pues tiene que haber en la base de datos una version 2 , si no nats me lo vuelve a enviar dentro de unos segundos ( procesar otra vez ) 
        // la funcion findByEvent esta descrita en el mismo Ticket model 

        if(!ticket) {
            throw new Error('ticket not found')
        
        }

        const { title, price } = data
        
        ticket.set({ title, price })

        await ticket.save()

    msg.ack() // ackowledging that the event was sent  
    }

}
