import mongoose from 'mongoose';
// import { BadRequestError } from '@gittixticket/common'
import { Order, OrderStatus } from './order'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current' // going to increment every time the version 

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}


export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }):Promise<TicketDoc | null >;

}

const ticketSchema = new mongoose.Schema({ 
    title: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    }

}, {

    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    
    }
});

ticketSchema.set('versionKey', 'version')
 ticketSchema.plugin(updateIfCurrentPlugin)

// si quiero usar la version de abajo // y commenta el plugin

// ticketSchema.pre('save', function(done){ // presave hook // me guardas  el archivo  cuando la version  sea igual a la version actual - 1  // ( la version actual seria la que estoy tratando de guardar creo )
//    // @ts-ignore

//     this.$where = {
//         version: this.get('version') - 1 // the current version - 1 , 

//     };

//     done()

// })

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({ // solo puede procesar eventos con la version anterior a esta , ejemplo esta version es la 3, pues tiene que haber en la base de datos una version 2 , si no nats me lo vuelve a enviar dentro de unos segundos ( procesar otra vez ) 
        _id: event.id,
        version: event.version - 1
    
    })

};


ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    })

}

ticketSchema.methods.isReserved = async function() {
    // this === the ticket document that we just called ' isReserved ' on

// run  query to look at all orders. find an order where the ticket is the ticket we just found *and* the orders status is not cancelled
// if we find an order from that means the ticket *is* reserved
    const existingOrder = await Order.findOne({
        ticket: this as any,
        status : {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]

        }
    });

    return !!existingOrder; // to make sure it returns a boolean  ( if null !! converts to false ) ( if 'kdkkd' !! convert to true)

}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export  { Ticket }