import { format } from 'date-fns';

const Post = ({ title, cover, summary, author, content, createdAt }) => {
    return (
        <div className='entry'>
            <div className='image__container'>
                <img src={'http://localhost:4000/' + cover} alt='article' />
            </div>
            <div className='text__container'>
                <h2>{title}</h2>
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