import { Message, Stan } from 'node-nats-streaming'
import { Subjects } from './subjects'

interface Event {
    subject: Subjects;
    data: any;
}

export abstract class Listener<T extends Event> { // T es como un tipo de parametro (TYPE) , y la extendemos a Event  si queremos utilizar las propiedades subject y data
    abstract subject: T['subject']; // parametro T ( TicketCreatedEvent ) de tipo subject
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'], msg: Message): void; // parametro T ( TicketCreatedEvent ) de tipo data
    private client: Stan;
    protected ackWait = 5 * 1000; // five seconds
    
    constructor(client: Stan) {
        this.client = client;
        
    }
    
    subscriptionOptions() {
        return this.client.subscriptionOptions() // this.client tiene una propiedad ( funcion ) llamada subscriptionOptions
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(this.ackWait) // by default is 30 seconds but we changed to 5 seconds // to resend the event if the event is not processed successfully
        .setDurableName(this.queueGroupName) // the same name of the queue group is gonna be the name of the durableName  // cause i rather so
    }
    
    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
            
            );
            
            subscription.on('message',(msg: Message) => {
                
                console.log(`Message received: ${this.subject} / ${this.queueGroupName} `)
                
                const parsedData = this.parseMessage(msg);
                this.onMessage(parsedData, msg);
                
            })
        };
        
        parseMessage(msg: Message) {
            const data = msg.getData() // getData retuns a string or a buffer
            
            return typeof data === 'string' 
            ? JSON.parse(data) // si es un string 
            : JSON.parse(data.toString('utf8')) // si es un buffer
        } 

}
