const Post = () => {
    return (
        <div className='entry'>
            <div className='image__container'>
                <img src='https://techcrunch.com/wp-content/uploads/2022/03/GettyImages-1284113343.jpg?w=1390&crop=1' alt='article' />
            </div>
            <div className='text__container'>
                <h2>Capital efficiency is the new VC filter for startups</h2>
                <p className='info'>
                    <span className='author'>Igor Shaverskyi</span>
                    <time>2:30 PM GMT+3•April 27, 2023</time>
                </p>
                <p className='summary'>The VC landscape has undergone a tectonic shift in the past year. A year ago, 90% of VC meetings with startups would have been about growth with little regard for how that growth would be achieved..</p>
            </div>
        </div>
    );
};

export default Post;