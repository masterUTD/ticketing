import request from 'supertest';
import { app } from '../../app'

const createTicket = () => {
    return request(app) //  make the request and immediately return the promise ,,con return funciona el await cuando llamo la funcion
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title: 'kfkmfm', price: 20 })

}

it('can fetch a list of tickets', async () => {

    // creating three tickets
    await createTicket() 
    await createTicket() 
    await createTicket()   

   const response = await request(app)
    .get('/api/tickets')
    .set('Cookie', global.signin())
    .send()  // enviamos la request sin ningun body 
    .expect(200)  
   
 expect(response.body.length).toEqual(3)  

});
