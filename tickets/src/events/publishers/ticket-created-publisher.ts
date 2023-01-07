import { Publisher, Subjects, TicketCreatedEvent } from '@gittixticket/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated

}