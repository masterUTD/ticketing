import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
   const cookie = await global.signin()


   const response =  await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie) // setting the cookie header // if in the browser, the browser send the cookie back to the server
    .send()
    .expect(400)

    expect(response.body.currentUser.email).toEqual('test@gmail.com')
    

});



it('responds with null if not authenticated', async () => {
   
 
    const response =  await request(app)
     .get('/api/users/currentuser')  
     .send()
     .expect(200)
 
     expect(response.body.currentUser).toEqual(null)
     
 
 });
