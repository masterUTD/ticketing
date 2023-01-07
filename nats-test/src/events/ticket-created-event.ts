import { Subjects } from './subjects'

export interface TicketCreatedEvent { // interface does not work to assign values to a variable , just types of datas
    subject: Subjects.TicketCreated;
    data: {
        id: string;
        title: string;
        price: number;
    }

}