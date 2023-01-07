import Link from 'next/link'

const Header = ({ currentUser }) => {

    const links = [
        !currentUser && { label: 'Sign Up', href: '/auth/signup'},   
        !currentUser && { label: 'Sign In', href: '/auth/signin'},
        currentUser && { label: 'Sell Tickets', href: '/tickets/new'},
        currentUser && { label: 'My Orders ', href: '/orders'},
        currentUser && { label: 'Sign Out', href: '/auth/signout'}
    ]
    .filter(linkConfig => linkConfig) // filtrando solo los verdaderos
    .map(({ label, href }) => {
            return <li key = { href } className = "nav-item">
                <Link className = "nav-link" href={href}>
                     { label }
                </Link>
            </li>
    
    })

    return <nav className = "navbar navbar-light bg-light" >
        <Link href ="/" className = "nav-link logo-padding">
            GitTix
        </Link>


        <div className = "d-flex justify-content-end">
            <ul className = "nav d-flex align-items-center">
                { links }

            </ul>
        </div>

    </nav>
}


export default Header;