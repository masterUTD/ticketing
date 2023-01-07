import { Publisher, Subjects, TicketUpdatedEvent } from '@gittixticket/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated

}