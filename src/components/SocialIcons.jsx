import React from 'react';
import { Github, Linkedin, Mail, Instagram, Twitter, HardDrive } from 'lucide-react';

const SocialIcons = ({ includeAll = false, size = 22 }) => {
    const socials = [
        { name: 'Email', icon: Mail, url: 'mailto:kylehonke@gmail.com' },
        { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/kylehonke' },
        { name: 'GitHub', icon: Github, url: 'https://github.com/kylehonke' },
        { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/groovykyle' },
    ];

    const allSocials = [
        ...socials,
        { name: 'Kaggle', icon: HardDrive, url: 'https://www.kaggle.com/kylehonke' },
        { name: 'X', icon: Twitter, url: 'https://twitter.com/grooovyKyle' },
    ];

    const list = includeAll ? allSocials : socials;

    return (
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
            {list.map((item) => (
                <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.name}
                    style={{
                        display: 'flex',
                        padding: '0.8rem',
                        color: '#718096',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#4a5568';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#718096';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <item.icon size={size} />
                </a>
            ))}
        </div>
    );
};

export default SocialIcons;
