import { Publisher, OrderCancelledEvent, Subjects } from '@gittixticket/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject : Subjects.OrderCancelled = Subjects.OrderCancelled

}