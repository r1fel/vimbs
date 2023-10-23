import bookImage from '../../assets/images/book.png';
import bookShelves from '../../assets/images/bookshelves.png';
import logout from '../../assets/images/logout.png';
import Link from './Link.jsx';


function NavBar() {

        const links =[
                { label: 'All books', path: '/allbooks', image: bookShelves},
                { label: 'My books', path: '/mybooks', image: bookImage},
                { label: 'Logout', path: '/logout', image: logout},
        ];

        const renderedLinks = links.map((link) => {
                return <Link key={link.label} to={link.path} image={link.image}>{link.label}</Link>
        })


        //Show navbar 
        return (<div className="navBar">
                <img id='logo' src={bookImage} />
                {renderedLinks}
        </div>)

}

export default NavBar;
