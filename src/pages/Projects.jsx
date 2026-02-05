import React from 'react';
import ProjectCard from '../components/ProjectCard';
import projectData from '../data/projects.json';

const Projects = () => {
    const professionalProjects = projectData.filter(p => p.type === 'professional');
    const funProjects = projectData.filter(p => p.type === 'fun');

    return (
        <div className="page-container">
            <h2 className="section-title">featured projects</h2>

            <div className="projects-list">
                {/* Timeline Line could be added via CSS ::before on projects-list if needed, keeping simple for now */}

                {professionalProjects.map((project, index) => (
                    <div key={project.id} className={`project-item ${index % 2 !== 0 ? 'reverse' : ''}`}>
                        <div className="project-card-wrapper">
                            <ProjectCard project={project} />
                        </div>
                        <div className="project-spacer"></div> {/* Empty space for alternating layout */}
                    </div>
                ))}
            </div>

            <h2 className="section-title">just for fun</h2>
            <div className="fun-projects-grid">
                {funProjects.map(project => (
                    <div key={project.id}> {/* Wrapper just in case ProjectCard needs height control */}
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
