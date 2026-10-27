import SocialIcons from '../components/SocialIcons';

const About = () => (
    <div className="page-container flex-center about-page">
        <div className="fade-in">
            <h1 className="section-title">about me</h1>

            <div className="glass-panel about-panel">
                <div className="about-body">
                    <p>
                        Hi! I&apos;m Kyle, an Austin native Software Development BAS student at ACC, graduating in December 2026. I&apos;m currently a Software Engineer at Clozure, where I&apos;m gaining hands-on experience working as part of an exceptional engineering team.
                    </p>

                    <p>
                        My interests span software engineering, machine learning, and data science. I&apos;ve worked with ML and AI systems from the data and modeling side as well as the software side, and I enjoy the challenge of taking an idea from an algorithm or prototype into something people actually use.
                    </p>

                    <p>
                        I tend to gravitate toward difficult problems and projects where there&apos;s something new to figure out. Whether I&apos;m learning a new technology, working through an unfamiliar codebase, or building something from scratch, I care about understanding how things work rather than simply getting them to work once.
                    </p>
                </div>

                <div className="about-divider" aria-hidden="true"></div>

                <p className="about-outro">
                    I&apos;m always open to new connections, collaborations, projects and ideas, so please don&apos;t hesitate to reach out!
                </p>
            </div>

            <SocialIcons includeAll size={32} />
        </div>
    </div>
);

export default About;
