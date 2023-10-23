import { useState, useContext } from 'react';
import UserContext from '../../context/user';


function RegisterForm({ setShowRegister }) {

    const { handleRegister } = useContext(UserContext);

    //Handle the data from the register form

    const [registerFormData, setRegisterFormData] = useState({ username: "", email: "", password: "" });

    const handleRegisterChange = (event) => {
        const changedField = event.target.name;
        const newValue = event.target.value;
        setRegisterFormData(currData => {
            currData[changedField] = newValue;
            return { ...currData };
        })

    }

    const handleRegisterSubmit = (event) => {
        event.preventDefault();
        handleRegister(registerFormData.username, registerFormData.email, registerFormData.password);
        setShowRegister(false);
    };

    //Register form

    return (<div>
        <h3>Register Form</h3>
        <form onSubmit={handleRegisterSubmit}>
            <p>
                <label>Username </label>
                <input
                    type="text"
                    placeholder="Username"
                    className="input"
                    value={registerFormData.username}
                    onChange={handleRegisterChange}
                    name="username"
                    id="username"
                />
            </p>
            <p>
                <label>E-mail </label>
                <input
                    type="text"
                    placeholder="E-mail"
                    className="input"
                    value={registerFormData.email}
                    onChange={handleRegisterChange}
                    name="email"
                    id="email"
                />
            </p>
            <p>
                <label>Password </label>
                <input
                    type="password"
                    placeholder="Password"
                    className="input"
                    value={registerFormData.password}
                    onChange={handleRegisterChange}
                    name="password"
                    id="password"
                />
            </p>
            <button onClick={handleRegisterSubmit} className="button">Register</button>
        </form>
    </div>)

}

export default RegisterForm;  