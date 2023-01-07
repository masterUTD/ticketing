import request from 'supertest';
import { app } from '../../app';

it('return a on successful signup', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'test@gmail.com',
        password: 'password'
    })
    .expect(201)

});


it('return a 400 with an invalid email', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'testllrkdkdkk.com',
        password: 'password'
    })
    .expect(400)

});


it('return a 400 with an invalid password', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'test@gmail.com',
        password: 'pas'
    })
    .expect(400)

});


it('return a 400 with missing email and password', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@gmail.com'}) 
    .expect(400)
    
    
    await  request(app)
    .post('/api/users/signup')
    .send({ password: 'password'})
    .expect(400)

});


it('disallow duplicate emails', async() => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'test@gmail.com',
        password: 'password'
    })
    .expect(201)


    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'test@gmail.com',
        password: 'password'
    })
    .expect(400)

});


it('sets a cookie after successful signup', async () =>  {
    const response = await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'test@gmail.com',
        password: 'password'
    })
    .expect(201)

    expect(response.get('Set-Cookie')).toBeDefined() // 'Set-Cookie' es el nombre del header that cookie-session sets in the response


})