import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'

it('returns 404 if the provided id does not exist ', async () =>  {
    const id = new mongoose.Types.ObjectId().toHexString();
      await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin()) // to be authenticated
        .send({ title: 'kdkkdkd', price: 20 })
        .expect(404)

});


it('returns 401 if the user is not authenticated ', async () =>  {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({ title: 'kdkkdkd', price: 20 })
      .expect(401)

});


it('returns 401 if the user does not own the ticket ', async () =>  {
       const response =  await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send({ 
                title: 'jdjjdj',
                 price: 20
             });

       await request(app)
             .put(`/api/tickets/${response.body.id}`)
             .set('Cookie', global.signin()) // aqui estamos iniciando session con otro userId // cada vez que invocamos global.signin()
             .send({ title: 'utjuy', price: 52 })
             .expect(401)

}); 


it('returns 400 if the user provide invalid title or price ', async () =>  {
     const cookie = global.signin() // pretending to be the same user over multiple requests
    // first creating the ticket
    const response =  await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie )
        .send({ 
            title: 'jdjjdj',
            price: 20
        });
    
        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie',cookie)
            .send({ title: '', price: 58})
            .expect(400)


        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie',cookie)
            .send({ title: 'kfiif', price: -54})
            .expect(400)

});

it('updates the ticket provided valid inputs ', async () =>  {
    const cookie = global.signin()

    const response =  await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie )
        .send({ 
            title: 'jdjjdj',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: 'New title', price: 100 })
        .expect(200)


     // we do not require authentication to fetch details about a single ticket
    const ticketResponse =  await request(app) 
        .get(`/api/tickets/${response.body.id}`)
        .send()
      expect(ticketResponse.body.title).toEqual('New title')
      expect(ticketResponse.body.price).toEqual(100)        
});


it('publishes an event' , async () =>  {
    const cookie = global.signin()

    const response =  await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie )
        .send({ 
            title: 'jdjjdj',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: 'New title', price: 100 })
        .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

})

it('rejects updates if the ticket is reserved', async () => {

    const cookie = global.signin()

    const response =  await request(app) // creando un ticket creo
        .post('/api/tickets')
        .set('Cookie',cookie )
        .send({ 
            title: 'jdjjdj',
            price: 20
        });

    const ticket = await Ticket.findById(response.body.id)

    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString()}) // making a ticket is reserved
    await ticket!.save()

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: 'New title', price: 100 })
        .expect(400) // no lo puedo actualizar por que el ticket esta reservado

})