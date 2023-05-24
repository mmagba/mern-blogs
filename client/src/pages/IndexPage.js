import { useEffect, useState } from "react";
import Post from "../components/Post";

const IndexPage = () => {

    const [blogsArray, setBlogsArray] = useState(null);

    useEffect(() => {
        fetch('http://localhost:4000/api/blogs').then(resonse => {
            resonse.json().then(blogs => {
                setBlogsArray(blogs);
            });
        });
    }, [])



    return (
        <>
            {blogsArray && blogsArray.map(blog => <Post {...blog} key={blog['_id']} />)}
        </>
    );
}

export default IndexPage;