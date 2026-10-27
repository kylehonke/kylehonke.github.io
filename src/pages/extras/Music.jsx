import PageIntro from '../../components/PageIntro';
import YouTubeLink from '../../components/YouTubeLink';

const videos = [
    { id: 'lpXh8Mjml1g', title: 'Princess Azula' },
    { id: 'XNjIxAyuzrI', title: 'smile' },
];

const Music = () => (
    <div className="page-container flex-center">
        <PageIntro title="music">
            <p className="intro-with-action">
                My hyper fixation during covid lockdowns was music production... you can be the judge of how that turned out
            </p>
            <YouTubeLink href="https://www.youtube.com/@groovyKyle">visit groovykyle</YouTubeLink>
        </PageIntro>

        <div className="video-grid">
            {videos.map(video => (
                <div key={video.id} className="video-embed">
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                        title={`${video.title} (YouTube video)`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            ))}
        </div>
    </div>
);

export default Music;
