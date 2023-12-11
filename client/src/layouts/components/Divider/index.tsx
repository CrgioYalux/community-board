const Divider: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`bg-blue-900 dark:bg-blue-200 ${className}`}></div>
    );
};

export default Divider;
