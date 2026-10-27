import { Github } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const ProjectCard = ({ project }) => {
    const [ref, inView] = useInView();

    return (
        <article ref={ref} className={`project-card${inView ? ' is-visible' : ''}`}>
            <div className="project-card-header">
                <h3 className="project-card-title">{project.title}</h3>
                {project.link && (
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card-repo"
                        aria-label={`${project.title} on GitHub`}
                    >
                        <Github size={20} aria-hidden="true" />
                    </a>
                )}
            </div>
            <p className="project-card-description">
                {project.description}
                {project.demoLink && (
                    <>
                        <br />
                        Try it{' '}
                        <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-link"
                            aria-label={`Try ${project.title}`}
                        >
                            Here
                        </a>
                    </>
                )}
            </p>
        </article>
    );
};

export default ProjectCard;
