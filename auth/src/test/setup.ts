import { MongoMemoryServer } from 'mongodb-memory-server'; // run multiples instances fo db of mongo in memory between differenet services at the same time
import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../app'


declare global { // to tell typescript that there's a global property(function) called signin
    var signin: () => Promise<string[]>;
  }

let mongo: any

beforeAll(async () => {

    process.env.MI_JWT = 'secret'; // process.env.MI_JWT solo existe en mi pod of kubernetes cluster , asi que la estoy redefiniendo para mis tests

     mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri)

});


beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for(let collection of collections ) {
        await collection.deleteMany({})
    }

});


afterAll( async () =>  {
    await mongo.stop()
    await mongoose.connection.close();

})

global.signin = async () => { // this global function will be available in all my test files //  cause we declare it in the test setup files
    const email = 'test@gmail.com'
    const password = 'password'


    const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password})
    .expect(201)

    const cookie = response.get('Set-Cookie') // extracting the set-cookie header that cookie-session send back in the response

    return cookie
}