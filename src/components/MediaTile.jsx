import { useState } from 'react';

// Image or video tile that swaps to a text placeholder when the file is missing.
const MediaTile = ({ type = 'image', src, alt, fallback, className = '' }) => {
    const [missing, setMissing] = useState(false);

    return (
        <div className={`media-tile ${className}`.trim()}>
            {missing ? (
                <span className="media-fallback">{fallback}</span>
            ) : type === 'video' ? (
                <video src={src} controls preload="metadata" onError={() => setMissing(true)}>
                    Your browser does not support the video tag.
                </video>
            ) : (
                <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setMissing(true)} />
            )}
        </div>
    );
};

export default MediaTile;
