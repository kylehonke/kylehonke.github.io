import ProjectCard from '../components/ProjectCard';
import projectData from '../data/projects.json';

const professionalProjects = projectData.filter(p => p.type === 'professional');
const funProjects = projectData.filter(p => p.type === 'fun');

const Projects = () => (
    <div className="page-container">
        <h1 className="section-title">featured projects</h1>
        <ul className="projects-list">
            {professionalProjects.map(project => (
                <li key={project.id}>
                    <ProjectCard project={project} />
                </li>
            ))}
        </ul>

        <h2 className="section-title">just for fun</h2>
        <ul className="fun-projects-grid">
            {funProjects.map(project => (
                <li key={project.id}>
                    <ProjectCard project={project} />
                </li>
            ))}
        </ul>
    </div>
);

export default Projects;
