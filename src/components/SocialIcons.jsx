import { Github, Linkedin, Mail, Instagram, Twitter, HardDrive } from 'lucide-react';

const primarySocials = [
    { name: 'Email', icon: Mail, url: 'mailto:kylehonke@gmail.com' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/kylehonke' },
    { name: 'GitHub', icon: Github, url: 'https://github.com/kylehonke' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/groovykyle' },
];

const allSocials = [
    ...primarySocials,
    { name: 'Kaggle', icon: HardDrive, url: 'https://www.kaggle.com/kylehonke' },
    { name: 'X', icon: Twitter, url: 'https://twitter.com/grooovyKyle' },
];

const SocialIcons = ({ includeAll = false, size = 22 }) => (
    <div className="social-icons">
        {(includeAll ? allSocials : primarySocials).map(({ name, icon: Icon, url }) => {
            const isEmail = url.startsWith('mailto:');
            return (
                <a
                    key={name}
                    href={url}
                    className="social-link"
                    title={name}
                    aria-label={isEmail ? 'Email Kyle' : `Kyle on ${name}`}
                    {...(isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                >
                    <Icon size={size} aria-hidden="true" />
                </a>
            );
        })}
    </div>
);

export default SocialIcons;
