import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Post = ({ _id, title, cover, summary, author, content, createdAt }) => {
    return (
        <div className='entry'>
            <div className='image__container'>
                <Link to={'/post/' + _id}>
                    <img src={cover} alt='article' />
                </Link>
            </div>
            <div className='text__container'>
                <Link to={'/post/' + _id}>
                    <h2>{title}</h2>
                </Link>
                <p className='info'>
                    <span className='author'>{author.username}</span>
                    <time>{format(new Date(createdAt), 'MMM d, yyy HH:mm')}</time>
                </p>
                <p className='summary'>{summary}</p>
            </div>
        </div>
    );
};

export default Post;