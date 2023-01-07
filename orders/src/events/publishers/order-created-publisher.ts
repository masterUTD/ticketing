import { Publisher, OrderCreatedEvent, Subjects } from '@gittixticket/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject : Subjects.OrderCreated = Subjects.OrderCreated

}