import PageIntro from '../../components/PageIntro';
import MediaTile from '../../components/MediaTile';
import restaurants from '../../data/restaurants.json';

const GALLERY = [1, 2, 3];

const Food = () => (
    <div className="page-container">
        <PageIntro title="food" className="intro-panel--food">
            <p>
                Because of course. My parents were in the restaurant industry, I spent many years in the service industry, and I&apos;ve probably tried over 75% of the restaurants in Austin. Here&apos;s a few of my favorites if you live nearby, plus a few pics if you&apos;re into that sort of thing
            </p>
        </PageIntro>

        <ul className="restaurant-list">
            {restaurants.map(place => (
                <li key={place.id} className="restaurant-card glass-panel">
                    <div>
                        <h2>{place.name}</h2>
                        <p>{place.description}</p>
                    </div>
                    <a href={place.link} target="_blank" rel="noopener noreferrer" className="restaurant-link">
                        visit website
                    </a>
                </li>
            ))}
        </ul>

        <h2 className="section-title food-gallery-title">gallery</h2>
        <div className="food-gallery">
            {GALLERY.map(n => (
                <MediaTile key={n} src={`/assets/food/gallery/food-${n}.jpg`} alt={`Food gallery photo ${n}`} fallback={`food placeholder ${n}`} className="media-tile--food" />
            ))}
        </div>
    </div>
);

export default Food;
