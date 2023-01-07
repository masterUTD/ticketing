import mongoose from 'mongoose';
import { OrderStatus } from '@gittixticket/common'
import { TicketDoc } from './ticket'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

export { OrderStatus }

interface OrderAttrs { 
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

// type OrderAttrs2 = Omit<OrderAttrs, 'version'>;

interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> { // <OrderAttrs>
    build(attrs: OrderAttrs): OrderDoc;

}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
     
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus), // extra make sure that just choose the values of OrderStatus enum
        default: OrderStatus.Created
    },

    expiresAt : {
        type: mongoose.Schema.Types.Date
    
    },

    ticket: { // referencia de ticket document
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }

}, {
    toJSON: { // convertimos en un json y asignamos una propiedad ( id ) que va igual al _id, y despues eliminamos la propiedad _id
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    
    }

})

orderSchema.set('versionKey', 'version')

orderSchema.plugin(updateIfCurrentPlugin)
orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs)

}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }