import { BrowserRouter } from 'react-router-dom';
import ThemeContextProvider from "../Theme";
import APIContextProvider from '../API';

const WrapperContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ThemeContextProvider>
            <APIContextProvider>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </APIContextProvider>
        </ThemeContextProvider>
    );
};

export default WrapperContextProvider;
