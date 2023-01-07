import { useEffect , useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/use-request'
import Router from 'next/router'

const OrderShow = ({ order, currentUser }) => {
    
    const [ timeLeft, setTimeLeft ] = useState(0)
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,

        },
        onSuccess: (payment) => Router.push("/orders") // onSuccess give me the response of the request
    })
    
    useEffect(() => {
        const findTimeLeft = () => {
            
            const msleft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msleft / 1000))  // divided by 1000 to convert the miliseconds into seconds , y redondeando la cantidad para que no tenga decimales
        }

       findTimeLeft() // invocando la funcion para no tener que esperar los  1000 milisegundos ( 1 segundo) que se demora el setInterval para invocar la funcion
       const timerId =  setInterval(findTimeLeft, 1000) // it is gonna call findTimeLeft (inmediatelly when reach this line) every 1000 miliseconds ( every second )
    
       return () => { // clean up function // when we are gonna navigate away fom this page (component) or we are not on this page ( component)
            clearInterval(timerId) // avoiding the setInterval to run forever

        }



    },[]) // just gonna run one time

    if(timeLeft < 0){
        return <div>Order Expired</div>
    
    }

    return <div>
         Time left to pay { timeLeft } seconds

            <StripeCheckout
                token = { ({ id }) => doRequest({ token: id }) } // passing as arguments , sending the token and the orderId (up, above) to the payments service
                stripeKey = "pk_test_51IWBgjExUpnN3Baw0GYgjuDaK0vk7uPITAwFY2CPBodGwF5RC8tkd5wWjDHfBNRNuIqynbPuSios9tk8WGCLq4mi00ClwSiHFC"
                amount = { order.ticket.price * 100 }
                email = { currentUser.email }

            />
            { errors }
            
        </div>

}

OrderShow.getInitialProps = async (context, client ) => {
    const { orderId } = context.query; // is orderId because we named the file orderId

    const { data } = await client.get(`/api/orders/${orderId}`)

    return { order: data}

}

export default OrderShow