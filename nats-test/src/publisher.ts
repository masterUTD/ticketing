import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher'
console.clear()

const stan = nats.connect('ticketing', 'abc', {  // le puedo poner de nombre client en vez de stan // es para conectar con el nats streaming server
    url: 'http://localhost:4222' // this must be the url of the nats streaming server

})


stan.on('connect', async () => {
    console.log('Publisher connected to nats server')

    const publisher = new TicketCreatedPublisher(stan)

    try { 
        await publisher.publish({
            id: '123',
            title: 'concert',
            price: 20
        })

    } catch(err) {
        console.error(err)
    
    }

    // const data = JSON.stringify({
    //     id: '123',
    //     title: 'concert',
    //     price: 250
    // })

    // stan.publish('ticket:created', data, () => { // the first argument es de subject or the channel  to submit // el tercer parametro(fucntion) es opcional
    //     console.log('Event published')
    
    // }) 
})


















// import nats from 'node-nats-streaming';

// console.clear()

// const stan = nats.connect('ticketing', 'abc', {  // le puedo poner de nombre client en vez de stan // es para conectar con el nats streaming server
//     url: 'http://localhost:4222' // this must be the url of the nats streaming server

// })


// stan.on('connect', () => {// this callback function will be executed after the client have successfully connected  to the nats streaming server
//     console.log('Publisher connected to nats server')
//     //nats just can send  strings and raw data , asi que convertimos el objecto en un json que a la final es un string

//     const data = JSON.stringify({
//         id: '123',
//         title: 'concert',
//         price: 250
//     })

//     stan.publish('ticket:created', data, () => { // the first argument es de subject or the channel  to submit // el tercer parametro(fucntion) es opcional
//         console.log('Event published') // publish data to nats streaming server
    
//     }) 
// })

