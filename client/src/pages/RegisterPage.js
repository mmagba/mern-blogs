import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [falseInfo, setFalseInfo] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const submitHandler = async (ev) => {
        ev.preventDefault();

        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 200) {
            setRedirect(true);
        } else {
            setFalseInfo(true);
        }



    };

    if (redirect) {
        return <Navigate to={'/login'} />
    }

    return (
        <form className="register-form" onSubmit={submitHandler}>
            <h1>Register</h1>
            <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" placeholder="username" />
            <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" placeholder="password" />
            <button>Register</button>
            {falseInfo && <p className='alert'>username is already taken</p>}

        </form>
    );
};

export default RegisterPage;