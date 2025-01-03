import { BrowserRouter } from 'react-router-dom';
import ThemeContextProvider from '../Theme';
import APIContextProvider from '../API';
import SessionContextProvider from '../Session';

const WrapperContextProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<ThemeContextProvider>
			<APIContextProvider>
				<SessionContextProvider>
					<BrowserRouter>{children}</BrowserRouter>
				</SessionContextProvider>
			</APIContextProvider>
		</ThemeContextProvider>
	);
};

export default WrapperContextProvider;
