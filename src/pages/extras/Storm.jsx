import PageIntro from '../../components/PageIntro';

// Files live in public/assets/storm/. List exact names (extension case matters on GitHub Pages).
const photos = [
    'storm-1.jpg', 'storm-2.jpg', 'storm-3.jpg', 'storm-4.JPG', 'storm-5.JPG', 'storm-6.JPG',
    'storm-7.JPG', 'storm-8.jpg', 'storm-9.JPG', 'storm-10.jpg', 'storm-11.JPG', 'storm-12.jpg',
    'storm-13.JPG', 'storm-14.jpg', 'storm-15.jpg', 'storm-16.JPG', 'storm-17.jpg', 'storm-18.jpg',
];

const Storm = () => (
    <div className="page-container flex-center">
        <PageIntro title="storm">
            <p>
                Storm Kitty Flacko Jodye (or just &apos;Storm&apos; for short) is my fluffy grey best friend. He was born in March 2020, making him a covid kitty with no respect for personal space. This space is just for him
            </p>
        </PageIntro>

        <div className="storm-gallery">
            {photos.map((file, i) => (
                <div key={file} className="gallery-item">
                    <img src={`/assets/storm/${file}`} alt={`Storm the cat, photo ${i + 1}`} loading="lazy" decoding="async" />
                </div>
            ))}
        </div>
    </div>
);

export default Storm;
