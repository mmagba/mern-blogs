import { Link } from "react-router-dom";

const NotFound = () => {
    return <div className='not-found__wrapper'>
        <h1>Page Not Found</h1>
        <Link to='/' >Home</Link>
    </div>
};

export default NotFound;