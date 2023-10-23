import { useState, useContext, useEffect } from 'react';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import Link from '../Navigation/Link.jsx';
import NavigationContext from '../../context/navigation';

function LoginRegisterForm(){

    const { currentPath } = useContext(NavigationContext);
    
    //Handle showing the register form
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        if(currentPath === "/register"){
            setShowRegister(true);
        }
        else{
            setShowRegister(false);
        }
    }, [currentPath]); 


    //Show either the login or register form
    let showRegisterOrLogin = (
    <div>
       <LoginForm /> 
        <div id="registerFormLink"><Link key="I don't have an account yet" to="/register">I don't have an account yet</Link></div>
    </div>
    )

    if(showRegister === true){
       showRegisterOrLogin = <RegisterForm setShowRegister = {setShowRegister}/>
    }
    return(showRegisterOrLogin)
}

export default LoginRegisterForm;