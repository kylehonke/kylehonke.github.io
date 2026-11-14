import { useState } from 'react';

const ProfileImage = ({ sources, alt, className, placeholder = false }) => {
    const [failedSources, setFailedSources] = useState([]);
    const src = sources.find(source => source && !failedSources.includes(source));

    if (!src) {
        return placeholder ? (
            <span className={`${className} profile-picture-placeholder`} role="img" aria-label={`${alt} unavailable`} />
        ) : null;
    }

    return (
        <img
            className={className}
            src={src}
            alt={alt}
            decoding="async"
            onError={() => setFailedSources(failed => [...failed, src])}
        />
    );
};

const ProfilePicture = ({ src, alt, animatedAvatar, frame, round = false }) => {
    const imageSources = [animatedAvatar?.animatedUrl, animatedAvatar?.staticUrl, src].filter(Boolean);
    const frameSources = [frame?.animatedUrl, frame?.staticUrl].filter(Boolean);

    return (
        <div className={`profile-picture${round ? ' profile-picture--round' : ''}`}>
            <div className={`profile-picture-stage${frameSources.length ? ' profile-picture-stage--framed' : ''}`}>
                <ProfileImage key={`image:${imageSources.join('|')}`} sources={imageSources} alt={alt} className="profile-picture-image" placeholder />
                <ProfileImage key={`frame:${frameSources.join('|')}`} sources={frameSources} alt="" className="profile-picture-frame" />
            </div>
        </div>
    );
};

export default ProfilePicture;
