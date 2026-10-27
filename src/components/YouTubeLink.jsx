import { Youtube } from 'lucide-react';

const YouTubeLink = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn-youtube">
        <Youtube size={20} aria-hidden="true" />
        {children}
    </a>
);

export default YouTubeLink;
