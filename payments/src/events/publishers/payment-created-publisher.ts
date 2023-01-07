import { Publisher, PaymentCreatedEvent, Subjects } from '@gittixticket/common'


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated


}