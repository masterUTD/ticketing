import useRequest from '../../hooks/use-request'
import Router from 'next/router'

const TicketShow = ({ ticket }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        
        },
        onSuccess: (order) => Router.push('/orders/[orderId]',  `/orders/${order.id}` )
    })

    return (
        <div>
            <h1>{ ticket.title }</h1>
            <h4> Price: { ticket.price }</h4>
            { errors }
            <button onClick = { () => doRequest() } className = "btn btn-primary">Purchase</button>
        </div>
        
     )

}

TicketShow.getInitialProps = async (context, client) => { // we dont want to use currentUser , that's because i did not bring it in
    const { ticketId } = context.query // ticketId por que asi le pusimos como nombre a este archivo

    const { data } = await client.get(`/api/tickets/${ticketId}`)

    return { ticket: data }
}

export default TicketShow;