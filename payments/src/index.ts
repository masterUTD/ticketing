import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper'
import { app } from './app'
import { OrderCancelledListener } from './events/listener/order-cancelled-listener';
import { OrderCreatedListener } from './events/listener/order-created-listener';


const start = async () => {

    if(!process.env.MI_JWT) {
        throw new Error('JWT iS NOT DEFINED')
    }

    if(!process.env.MONGO_URI) {
        throw new Error('MONGO_URI MUST be defined')
    }

    
    if(!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID MUST be defined')
    }

    
    if(!process.env.NATS_URL) {
        throw new Error('NATS_URL MUST be defined')
    }


    
    if(!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID MUST be defined')
    }

 try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)  // clusterId , clientId , url

    natsWrapper.client.on('close', () => {
        console.log('Nats connection closed')
        process.exit()
    
    })

    
    process.on('SIGINT', () => natsWrapper.client.close()); // interrupt signals 
    process.on('SIGTERM', () => natsWrapper.client.close()); // terminate signals
    
    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()
          
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to Mongodb')
    

} catch(err) {
    console.error(err)
}

app.listen(3000, () => {
    console.log('listening on port 3000!!!');
});
    
}

start() 
