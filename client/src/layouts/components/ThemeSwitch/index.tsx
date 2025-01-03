import SunIcon from '../../../components/Icons/Sun';
import MoonIcon from '../../../components/Icons/Moon';
import { useTheme } from '../../../providers/Theme';

const ThemeSwitch: React.FC<{ className?: string }> = ({ className = '' }) => {
	const [theme, switchTheme] = useTheme();

	return (
		<button onClick={switchTheme} className={` ${className}`}>
			{theme.current === 'dark' ? <SunIcon /> : <MoonIcon />}
		</button>
	);
};

export default ThemeSwitch;
