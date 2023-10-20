import { useState, useContext } from 'react';
import UserContext from '../../context/user';
import NavigationContext from '../../context/navigation';


function LoginForm() {

    const { handleLogin } = useContext(UserContext);
    const { navigate } = useContext(NavigationContext);

    //Handle the data from the login form

    const [formData, setFormData] = useState({ username: "", password: "" });

    const handleChange = (event) => {
        const changedField = event.target.name;
        const newValue = event.target.value;
        setFormData(currData => {
            currData[changedField] = newValue;
            return { ...currData };
        })

    }

    const handleSubmit = (event) => {
        event.preventDefault();
        handleLogin(formData.username, formData.password);
        setFormData({ username: "", password: "" });        
    };

    //Login form

    return (<div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <p>
                <label>Username </label>
                <input
                    type="text"
                    placeholder="Username"
                    className="input"
                    value={formData.username}
                    onChange={handleChange}
                    name="username"
                    id="username"
                />
            </p>
            <p>
                <label>Password </label>
                <input
                    type="password"
                    placeholder="Password"
                    className="input"
                    value={formData.password}
                    onChange={handleChange}
                    name="password"
                    id="password"
                />
            </p>
            <button onClick={handleSubmit} className="button">Login</button>
        </form>
    </div>)

}

export default LoginForm;







