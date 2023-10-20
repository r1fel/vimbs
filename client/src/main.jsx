import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { Provider as BooksProvider } from './context/books';
import { Provider as UserProvider } from './context/user';
import { NavigationProvider } from './context/navigation';
import { BorrowLendProvider } from './context/borrowLend.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BorrowLendProvider>
    <NavigationProvider>
      <UserProvider>
        <BooksProvider>
          <React.StrictMode>
            <App />    
          </React.StrictMode>
        </BooksProvider>
      </UserProvider>
    </NavigationProvider>
  </BorrowLendProvider>,
)
