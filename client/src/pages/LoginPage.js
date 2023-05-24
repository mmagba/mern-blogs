import { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from "../UserContext";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [falseInfo, setFalseInfo] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const { setUserInfo } = useContext(UserContext);

    const submitHandler = async (ev) => {
        ev.preventDefault();
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (response.ok) {
            response.json().then(userinfo => {
                setUserInfo(userinfo);
                setRedirect(true);
            })

        } else {
            setFalseInfo(true);
        }
    };

    if (redirect) {
        return <Navigate to={'/'} />
    }



    return (
        <form className="login-form" onSubmit={submitHandler}>
            <h1>Login</h1>
            <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" placeholder="username" />
            <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" placeholder="password" />
            <button>Login</button>
            {falseInfo && <p className='alert'>false username or password</p>}
        </form>
    );
};

export default LoginPage;