import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import WrapperContextProvider from './providers/Wrapper';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WrapperContextProvider>
			<App />
		</WrapperContextProvider>
	</React.StrictMode>
);
