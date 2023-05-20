import DOMPurify from 'dompurify';
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from '../UserContext';
import NotFound from './NotFound';

export default function PostPage() {
    const [postInfo, setPostInfo] = useState(null);
    const { userInfo } = useContext(UserContext);
    const { id } = useParams();
    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => {
                response.json().then(postInfo => {
                    setPostInfo(postInfo);
                });
            });
    }, [id]);

    if (!postInfo) {
        return <NotFound />
    }

    const sanitizedContent = DOMPurify.sanitize(postInfo.content);

    return (
        <div className="post-page">
            <h1>{postInfo.title}</h1>
            <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
            <div className="author">by @{postInfo.author.username}</div>
            {userInfo?.id === postInfo.author._id && <Link to={'/edit/' + id}><button className='edit-btn'>Edit post</button></Link>}
            {userInfo?.id === postInfo.author._id && <Link to={'/delete/' + id}><button className='delete-btn'>Delete post</button></Link>}

            <div className="image">
                <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
            </div>
            <div className='content' dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>
    );
}