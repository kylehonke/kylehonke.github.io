// Page heading plus the white intro panel shared by the Extras pages.
const PageIntro = ({ title, className = '', children }) => (
    <>
        <h1 className="section-title">{title}</h1>
        <div className={`glass-panel intro-panel ${className}`.trim()}>
            {children}
        </div>
    </>
);

export default PageIntro;
