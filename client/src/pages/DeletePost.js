import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const DeletePost = () => {
    const { id } = useParams();
    const [title, setTitle] = useState(null);
    const [redirectToHome, setRedirectToHome] = useState(false);
    const [redirectToPost, setRedirectToPost] = useState(false);


    useEffect(() => {
        fetch(`http://localhost:4000/api/post/${id}`)
            .then(response => {
                response.json().then(postInfo => {
                    setTitle(postInfo.title);
                });
            });
    }, [id]);


    async function deletePost(ev) {
        try {
            const response = await fetch(`http://localhost:4000/api/delete/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                setRedirectToHome(true);
            }

        } catch (err) {
            console.log(err);
        }
    }

    if (redirectToHome) {
        return <Navigate to={'/'} />;
    }

    if (redirectToPost) {
        return <Navigate to={'/post/' + id} />;
    }

    return (
        <div className="delete-page">
            <h3>Are you sure you want to delete this post?</h3>

            {'"' + title + '"'}
            <div className="delete-actions">
                <button onClick={deletePost} className="delete-btn" >Yes</button>
                <button onClick={() => { setRedirectToPost(true) }}>No</button>
            </div>
        </div>
    )
};

export default DeletePost;