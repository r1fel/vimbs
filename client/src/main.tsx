import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './main.scss';
import {Provider as UserProvider} from './context/UserContext';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

//data get stale after 5 min
const queryClient = new QueryClient({
  defaultOptions: {queries: {staleTime: 1000 * 60 * 5}},
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>,
);
