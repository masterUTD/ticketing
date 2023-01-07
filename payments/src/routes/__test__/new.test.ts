import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/order';
import { OrderStatus } from '@gittixticket/common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

// jest.mock('../../stripe.ts') // to use the mock version 

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'jdjjdjjd',
        orderId: new mongoose.Types.ObjectId().toHexString() // no es el id del orderId que esta guardada en la base de datos ,, en realidad no hay ninguna orden guardada en la base de datos
    })
    .expect(404)

});

it('return a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status:OrderStatus.Created
    })

    await order.save()


    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'jdjjdjjd',
            orderId: order.id
        })
        .expect(401)

});



it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString() // creating an userId

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId, // passing the userId that will create the order
        version: 0,
        price: 20,
        status:OrderStatus.Cancelled
    })

    await order.save()

    
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId)) // the same userId who created the order is the same userId who is logged in
        .send({
            token: 'jdjjdjjd',
            orderId: order.id
        })
         .expect(400)


});


// it('returns a 204 with valid inputs ', async () => { // uncomment the jest.mock and the stripe.ts.old
//     const userId = new mongoose.Types.ObjectId().toHexString() // creating an userId

//     const order = Order.build({
//         id: new mongoose.Types.ObjectId().toHexString(),
//         userId: userId, // passing the userId that will create the order
//         version: 0,
//         price: 20,
//         status:OrderStatus.Created
//     })

//     await order.save()

//     await request(app)
//         .post('/api/payments')
//         .set('Cookie', global.signin(userId))
//         .send({
//             token: 'tok_visa',
//             orderId: order.id
//         })

//         .expect(201)

//     const chargeOptions = (stripe.charges.create as jest.Mock ).mock.calls[0][0]

//     expect(chargeOptions.source).toEqual('tok_visa')
//     expect(chargeOptions.amount).toEqual(20 * 100)
//     expect(chargeOptions.currency).toEqual('usd')

// });


it('returns a 204 with valid inputs ', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString() // creating an userId
    const price = Math.floor(Math.random() * 100000 );

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId, // passing the userId that will create the order
        version: 0,
        price: price,
        status:OrderStatus.Created
    })

    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })

        .expect(201)

    const stripeCharges = await stripe.charges.list({ limit : 50 })  // give me  the last 50 charges   
    
    const stripeCharge = stripeCharges.data.find((charge) => { // stripeCharge me retorna Stripe.Charge or undefined
        return charge.amount === price * 100
    
    })

    expect(stripeCharge).toBeDefined()
    expect(stripeCharge!.currency).toEqual('usd')

    const payment = await Payment.findOne({ // payment me retorna PaymentDoc or null
        orderId: order.id,
        stripeId: stripeCharge!.id

    })

    // undefined and null are two different things
    expect(payment).not.toBeNull()

});