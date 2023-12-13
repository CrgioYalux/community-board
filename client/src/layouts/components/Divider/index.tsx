const Divider: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`bg-current ${className}`}></div>
    );
};

export default Divider;
