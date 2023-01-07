import { useEffect } from 'react'
import useRequest from '../../hooks/use-request'
import Router from 'next/router'

export default () => {

    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () =>  Router.push('/')

    });


    useEffect(() => {
        doRequest()  
        
    }, []); // an empty array means just to run useEffect one time

    return <div>Signing you out....</div>


}