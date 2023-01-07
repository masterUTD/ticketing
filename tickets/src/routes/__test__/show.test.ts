import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

//para poder imprimir un console en mis tests tengo que eleminar el .expect() // por que el .expect() lo que hace es tirrar un error si no cumple con el expect  y no deja que javascript continue con al segunda linea de codigo que seria el console.log()

it('returns a 404 if the ticket is not found', async () => {
     const id = new mongoose.Types.ObjectId().toHexString(); // generate a mongodb id
    
     await request(app)
    .get(`/api/tickets/${id}`) // a real mongo id
    .send() 
    .expect(404)
    

});
 
it('returns a ticket if the ticket is found', async () => {
    const title: string = 'the queen'
    const price: number = 20

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title, price })
        .expect(201)


    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200)  

      expect(ticketResponse.body.title).toEqual(title)  
      expect(ticketResponse.body.price).toEqual(price)

});