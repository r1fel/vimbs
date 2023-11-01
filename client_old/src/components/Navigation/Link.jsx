import { useContext } from 'react';
import NavigationContext from '../../context/navigation';

function Link({ to, children, image }){
    const { navigate} = useContext(NavigationContext);
    const handleClick = (event) =>{
        event.preventDefault();
        navigate(to);
    };

    return <a onClick={handleClick} ><img className='linkImage' src={image} /> {children}</a>
}

export default Link;