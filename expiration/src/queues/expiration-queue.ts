import Queue from 'bull'
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher'
import { natsWrapper  } from '../nats-wrapper'

interface Payload {
    orderId: string

}

const expirationQueue = new Queue<Payload>('order:expiration', { // primer parametro es como si fuera el channel donde va a almacenar el job que va a enviar 
    redis: {
        host: process.env.REDIS_HOST
    
    }

});

expirationQueue.process( async (job) => { // job is an object that wraps up our data
    // console.log('i want to publish an expiration:complete event for orderId ' , job.data.orderId )

    new ExpirationCompletePublisher(natsWrapper.client).publish({ // in 15 minutes will publish to any service that is listening for the  expiration:complete channel 
        orderId: job.data.orderId
    })

});

export { expirationQueue }