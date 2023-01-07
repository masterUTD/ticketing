import { PaymentCreatedEvent, Subjects, Listener,OrderStatus } from "@gittixticket/common";
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated

    queueGroupName =  queueGroupName

   async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId)
        
        if(!order) {
            throw new Error('Order not found')
        
        }

        order.set({ status: OrderStatus.Complete })

        await order.save() // every single time we make a save , we make a change it will increment the version number
    

        // maybe an additional event tipe inside of our app
        // to emit the data with the current version that just saved 
        // we are not implementing that in our app just to save time and cause the order is not gonna be updated anymore because is paid already(complete)
        msg.ack()

    }

}