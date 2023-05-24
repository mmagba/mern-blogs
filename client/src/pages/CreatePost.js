import 'react-quill/dist/quill.snow.css';
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import { UserContext } from '../UserContext';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(false);
    const [emptyInputAlert, setEmptyInputAlert] = useState(false);

    const [redirect, setRedirect] = useState(false);



    const { userInfo } = useContext(UserContext);
    if (!userInfo) {
        return <h1 className='alert'>You need to log in to create posts.</h1>
    }


    async function createNewPost(ev) {
        ev.preventDefault();
        setLoading(true);
        setAlert(false);
        setEmptyInputAlert(false);
        if (title.trim() === '' || summary.trim() === '' || content.trim() === '' || files.length === 0) {
            setLoading(false);
            setEmptyInputAlert(true);
            return;
        }
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);
        const response = await fetch('http://localhost:4000/post', {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        if (response.ok) {
            setRedirect(true);
        } else {
            setLoading(false);
            setAlert(true);
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }
    return (
        <form className='post-form' onSubmit={createNewPost}>
            <input type="title"
                placeholder={'Title'}
                value={title}
                onChange={ev => setTitle(ev.target.value)} />
            <input type="summary"
                placeholder={'Summary'}
                value={summary}
                onChange={ev => setSummary(ev.target.value)} />
            <input type="file"
                onChange={ev => setFiles(ev.target.files)} />
            <Editor value={content} onChange={setContent} />
            {loading ? <span>Posting ...</span> : <button style={{ marginTop: '5px' }}>Create post</button>}
            {alert && <p className='alert'>Something went wrong.</p>}
            {emptyInputAlert && <p className='alert'>Please fill all inputs.</p>}
        </form>
    );
}