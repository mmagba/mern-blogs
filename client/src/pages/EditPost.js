import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";

export default function EditPost() {

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(false);
    const [emptyInputAlert, setEmptyInputAlert] = useState(false);

    const { id } = useParams();
    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => {
                response.json().then(postInfo => {
                    setTitle(postInfo.title);
                    setContent(postInfo.content);
                    setSummary(postInfo.summary);
                });
            });
    }, [id]);

    async function editPost(ev) {
        ev.preventDefault();
        setLoading(true);
        setAlert(false);
        setEmptyInputAlert(false);
        if (title.trim() === '' || summary.trim() === '' || content.trim() === '') {
            setLoading(false);
            setEmptyInputAlert(true);
            return;
        }
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if (files?.[0]) {
            data.set('file', files[0]);
        }
        const response = await fetch('http://localhost:4000/edit', {
            method: 'PUT',
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
        return <Navigate to={'/post/' + id} />
    }


    return (
        <form className='post-form' onSubmit={editPost}>
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
            {loading ? <span>Editing ...</span> : <button style={{ marginTop: '5px' }}>Edit post</button>}
            {alert && <p className='alert'>Something went wrong.</p>}
            {emptyInputAlert && <p className='alert'>Please fill all inputs.</p>}
        </form>
    );
}