import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto' // create random bytes
import { TicketCreatedListener } from './events/ticket-created-listener'

console.clear() // me limpia los console.log cada vez que se ejecuta este archivo

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {  // the second argument is the client id
    // the nats streaming server no puede tener el mismo clientid de dos servicios , solo de uno por eso lo estamos generando de forma aleatoria para correr dos instanacias de este mismo servicio con diferentes clientids ( solo para escalar un servicio de forma horizontal)
    url: 'http://localhost:4222'

})


stan.on('connect', () => {
    console.log('Listener connected to nats server')

    stan.on('close', () => { // every time we trying to close this client or disconnect this client
        console.log('Nats connection closed')
        process.exit() // in this process do not do anything else
    
    });

    new TicketCreatedListener(stan).listen();

});

process.on('SIGINT', () => stan.close()); // interrupt signals 
process.on('SIGTERM', () => stan.close()); // terminate signals


































// import nats, { Message, Stan } from 'node-nats-streaming'
// import { randomBytes } from 'crypto' // create random bytes

// console.clear() // me limpia los console.log cada vez que se ejecuta este archivo

// const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {  // the second argument is the client id
//     // the nats streaming server no puede tener el mismo clientid de dos servicios , solo de uno por eso lo estamos generando de forma aleatoria para correr dos instanacias de este mismo servicio con diferentes clientids ( solo para escalar un servicio de forma horizontal)
//     url: 'http://localhost:4222'

// })


// stan.on('connect', () => {
//     console.log('Listener connected to nats server')

//     stan.on('close', () => { // every time we trying to close this client or disconnect this client
//         console.log('Nats connection closed')
//         process.exit() // in this process do not do anything else
    
//     })

//     const options = stan.subscriptionOptions() // to chain subscription options
//     .setManualAckMode(true) // to remove the default behavior when an event is received // like a payment event, if something goes wrong inside of our message handler ( saving into a database ) the event get lost , and we do not want that , we want to reprocess the event again cause is a critical information inside the event
//     .setDeliverAllAvailable() // retrieve all the events nats streaming server have ever emmited in the past
//     .setDurableName('accounting-service') // set a durable subscription // a name of the identifier for this subscription
//     // setDurableName makes setDeliverAllAvailable retrieve all the past events just for the very first time we create this subscription ( service online), not when the server gets restarted, just when we create this service ( subscription for the first time)
//    //durable subscription makes sure that our services never miss out an event , also make sure that we do not  erroneously reprocess an event in the future


//     const subscription = stan.subscribe('ticket:created', // me va a suscribir a este especifico channel 
//      'queue-group-name', // el queue group  this listener is going to join// make sure all the events go to just one instance of our service ( either instance 1 or 2 or 3 but just go to one instance ) if we are running multiple instances ( scaling horizontally )//even if we disconnect, ( our service goes down for any time ) all clients all, subscriptions, this property ( queue-group-name ) makes sure that setDurableName does not dump( wipe off ) all the history of the durable subscription ( to avoid redeliver all the past events emmited )
//     options  ) /* thrid option is optional */

//     subscription.on('message', (msg: Message) => { // me va a escuchar por los mensajes
//         const data = msg.getData()

//         if(typeof data === 'string') {
//             console.log(`Received event #${msg.getSequence()}, with data ${data}`)
        
//         }
        
//         msg.ack() // to tell nats streaming server  that we received the message and was processed // manual ackowledged (setManualAckMode) // to tell nats streaming server that we processed the information successfully
//     })

// })

// process.on('SIGINT', () => stan.close()); // interrupt signals 
// process.on('SIGTERM', () => stan.close()); // terminate signals
// are sent to this process every time that the T.S.A node dev tries to restart our program, or any time you hit ctrl + c in your terminal

// if we don't ackowledge manually , nats will send to another or listener which is listening o the same queue name
// si no hay mas listener escuchando en el misnmo queue name se la envia al mismo listener que se la envio primero 
// por que no hicimos un acknowledge manual diciendo que el evento se proceso correctamente ( le quitamos el acknowledge por defecto con esta propiedad  .setManualAckMode(true) )
// hago el ackowledge manual para estar seguro que el mensaje se proceso correctament, despues de haberse procesafo correctamnete el hago el ackowlede manual para -
// que nats streaming server ya no se preocupe por ese mensaje ( evento ) y no lo reenvie de nuevo a otro listener escuchando en el mismo queue group name ( si hay mas de uno ) sino la envia al mnismo que la envio al principio para que la re procese otra vez


// inside the channel we are subcribed there may have queue groups if we want 