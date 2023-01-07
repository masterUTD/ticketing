import mongoose from 'mongoose'
import  request  from 'supertest';
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

it('fetches the order ', async () =>  {
    // create a ticket

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 25

    })

    await ticket.save()

    const user = global.signin()

    //make a request to build an order with this ticket
    const { body: order } = await request(app) // destructurando la propiedad body y reasignandole el nombre order
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)


    // make request to fetch the order 
    const {body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200)

     expect(fetchedOrder.id).toEqual(order.id)   

});




it('returns an error if one user tries to fetch another user order ', async () =>  {
    // create a ticket

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 25

    })

    await ticket.save()

    const user = global.signin()

    //make a request to build an order with this ticket
    const { body: order } = await request(app) // destructurando la propiedad body y reasignandole el nombre order
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)


    // make request to fetch the order 
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin()) // a new user ( another user ) iniciando session sesion con  otro ususario
        .send()
        .expect(401)  

});

