import type { Theme } from './types';

import { createContext, useContext, useState, useEffect } from 'react';
import { getSystemTheme, applyTheme } from './helpers';

const Context = createContext<Theme.Context>({} as Theme.Context);

const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme.Value>('dark');

    useEffect(() => {
        const lastPreferredTheme = localStorage.getItem('theme') as Theme.Value;

        if (lastPreferredTheme === null) {
            const systemTheme = getSystemTheme();
            setTheme(systemTheme);
            applyTheme(systemTheme);
            return;
        } 

        setTheme(lastPreferredTheme);
        applyTheme(lastPreferredTheme);
    }, []);

    const switchTheme = (): void => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    const value: Theme.Context = [{ current: theme, opposite: theme === 'dark' ? 'light' : 'dark' }, switchTheme];

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    );
};

export default ThemeContextProvider;
export const useTheme = () => useContext<Theme.Context>(Context);
