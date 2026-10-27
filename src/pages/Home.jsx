import SocialIcons from '../components/SocialIcons';
import MouseTrail from '../components/MouseTrail';

const Home = () => (
    <div className="home-container">
        <h1 className="home-title fade-in">hi, i&apos;m kyle</h1>

        <div className="home-subtitle">
            <p className="fade-in">welcome to my website :)</p>
        </div>

        <div className="home-socials fade-in">
            <SocialIcons />
        </div>

        <MouseTrail />
    </div>
);

export default Home;
