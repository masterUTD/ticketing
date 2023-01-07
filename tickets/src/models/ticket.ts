import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
    title: string;
    price: number; 
    userId: string;
}


interface TicketDoc extends mongoose.Document{
    title: string;
    price: number; 
    userId: string;
    version: number;
    orderId?: string;
}


interface TicketModel  extends mongoose.Model<TicketDoc>{
    build(attrs: TicketAttrs):TicketDoc;


}

const ticketSchema = new mongoose.Schema({ 
    title: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    userId: {
        type: String,
        required: true
    },

    orderId: {
        type: String
    
    }

},
{
    toJSON: {
        transform(doc, ret) { // , ret is the object that is just about to be turned into json // we are going to make some direct change to that ret object,, we are not gonna return anythong , just modify the ret object
            ret.id = ret._id;
            delete ret._id
        
        }        
    }

});

ticketSchema.set('versionKey', 'version') // agregandole la propiedad version en vez de __v: que mongodb trae por defecto
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: TicketAttrs) => { // this is going to be the one and only way that we create records, just to make sure typescript the types of attributes are supposed to be providing
    return new Ticket(attrs)

};


const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema); 

export { Ticket };