import { Publisher, ExpirationCompleteEvent, Subjects } from '@gittixticket/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete

    

}