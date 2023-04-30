import { useState } from 'react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const submitHandler = async (ev) => {
        ev.preventDefault();
         await fetch('http://localhost:4000/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' }
        });

        

    };



    return (
        <form className="login-form" onSubmit={submitHandler}>
            <h1>Login</h1>
            <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" placeholder="username" />
            <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" placeholder="password" />
            <button>Login</button>
        </form>
    );
};

export default LoginPage;