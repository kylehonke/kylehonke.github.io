import PageIntro from '../../components/PageIntro';
import YouTubeLink from '../../components/YouTubeLink';

const Lego = () => (
    <div className="page-container flex-center">
        <PageIntro title="lego">
            <p className="intro-with-action">
                My most successful YouTube venture... and my most expensive hobby
            </p>
            <YouTubeLink href="https://www.youtube.com/@groovybricks">explore groovybricks</YouTubeLink>
        </PageIntro>
    </div>
);

export default Lego;
