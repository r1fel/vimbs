import { useEffect, useContext, useState } from 'react';

import BookCreate from './components/BookCreate';
import BookList from './components/BookList';
import BookSearch from './components/BookSearch';
import NavBar from './components/Navigation/NavBar';
import LoginRegisterForm from './components/LoginRegister/LoginRegisterForm';
import BookShowSingle from './components/BookShowSingle';

import BooksContext from './context/books';
import UserContext from './context/user';
import NavigationContext from './context/navigation';

import './styles/App.css';
import './styles/BorrowLend.css';



function App() {

  const { handleFetchBooks, bookInfo, singleBook, setSingleBook } = useContext(BooksContext);
  const { showLogin, handleLogout, handleLogin } = useContext(UserContext);
  const { currentPath, navigate } = useContext(NavigationContext);
  const [showSingle, setShowSingle ] = useState(false);

  //useEffect to populate books at first login
  useEffect(() => {
    if(showLogin === false){
      navigate("/allbooks");
    }
  }, [showLogin]);

  //routing after first login
  useEffect(() => {
    if (currentPath === "/allbooks") {
      handleFetchBooks("");
      setShowSingle(false);
      setSingleBook({});
    }
    else if (currentPath === "/mybooks") {
      handleFetchBooks("mine");
      setShowSingle(false);
      setSingleBook({});
    }
    else if (currentPath === "/logout") {
      setShowSingle(false);
      setSingleBook({});
      handleLogout();
      navigate("/");
    }
    else if (showLogin === false){
      if(currentPath != "/"){
        bookInfo(currentPath);
        setShowSingle(true);
      }
    }
  }, [currentPath]);

  //easy login buttons for testign DELETE BEFORE PUBLISH
  const handleLoginBob = (event) => {
    event.preventDefault();
    handleLogin("bob", "bob");
  };
  const handleLoginBibi = (event) => {
    event.preventDefault();
    handleLogin("bibi", "bibi");
  };
  const handleLoginBodo = (event) => {
    event.preventDefault();
    handleLogin("bodo", "bodo");
  };
  const handleLoginAlex = (event) => {
    event.preventDefault();
    handleLogin("Alex", "Alex");
  };

  
  //show login page if not logged in yet
  let showPage = <div>
    <NavBar />
    <LoginRegisterForm />
    <button onClick={handleLoginBob}>Bob</button>
    <button onClick={handleLoginBibi}>Bibi</button>
    <button onClick={handleLoginBodo}>Bodo</button>
    <button onClick={handleLoginAlex}>Alex</button>
  </div>

  //show application when loggedin
  if (showLogin == false){
    if (showSingle == true){
      showPage = <div>
      <NavBar />
      <BookShowSingle />
      </div>
    }
    else{
      showPage =
      <div>
        <NavBar />
        <BookSearch />
        <BookCreate />
        <BookList />
      </div>
    }   
  }

  return (showPage)

}

export default App
