import { Link } from 'react-router';

const NotFound = () => (
    <div className="page-container flex-center not-found">
        <h1 className="section-title">page not found</h1>
        <p>That page doesn&apos;t exist (or Storm knocked it off the table).</p>
        <Link to="/" className="text-link">back home</Link>
    </div>
);

export default NotFound;
