const StatFigure = ({ value, label, className = '' }) => (
    <div className={`stat-figure ${className}`.trim()}>
        <p>{value}</p>
        <span>{label}</span>
    </div>
);

export default StatFigure;
