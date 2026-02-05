import React from 'react';
import { Github } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectCard = ({ project }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="project-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '2rem',
                background: 'white',
                borderRadius: '4px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                borderLeft: '4px solid var(--pastel-seafoam)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#2d3748', textTransform: 'lowercase' }}>{project.title}</h3>
                {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e0' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#4a5568'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}
                    >
                        <Github size={20} />
                    </a>
                )}
            </div>
            <p style={{ color: '#718096', lineHeight: '1.7', fontSize: '1rem' }}>{project.description}</p>
        </motion.div>
    );
};

export default ProjectCard;
