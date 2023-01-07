import { Stan } from 'node-nats-streaming'
import { Subjects } from './subjects'

interface Event {
    subject: Subjects;
    data: any;

}

export abstract class Publisher<T extends Event> {
    abstract subject: T['subject'];
    private client: Stan;

    constructor(client: Stan) {
        this.client = client
    
    }

    publish(data: T['data']): Promise<void> { // una funcion promesa ( async await ) que no va a retornar nada
        return new Promise( (resolve, reject) => { 

            this.client.publish(this.subject, JSON.stringify(data), (err) => { // this.client tiene una propiedad( funcion ) llamada publish
                if(err) {
                    reject(err)
                
                } 
                console.log('Event published to subject', this.subject)
                resolve()
             })
            
        });



    };
 
};