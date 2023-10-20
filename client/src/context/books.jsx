import { createContext, useState } from 'react';
import axios from 'axios';

const BooksContext = createContext();

function Provider({ children }){

    //start arrays for books in database and searchquery
    const [searchBooks, setSearchBooks] = useState([]);    
    const [books, setBooks] = useState([]);
    const [singleBook, setSingleBook] = useState({});
    const [showBooks, setShowBooks] = useState("mine");

    //Fetching books from user
    const handleFetchBooks = async (showIdentifier) => {
        setShowBooks(showIdentifier);
        try {
        const response = await axios.get(`http://localhost:8080/books/${showIdentifier === 'mine' ? 'mine' : ''}`, { withCredentials: true });
        setBooks(response.data);
        } catch (e) {
        console.log(e)
        };
    };


  //function on clicking Add a Book
  const createBook = async (title, author, isbn, blurb) => {
    try {
      const input = {
        book: { title, author, image: "https://tse1.explicit.bing.net/th?id=OIP.TF-ZDchnQgWskBRH8ZNu1gHaI6&pid=Api", isbn, blurb }
      };
      const response = await axios.post('http://localhost:8080/books', input, { withCredentials: true });
      handleFetchBooks("mine");
    } catch (e) {
      console.log(e)
    };
  }

  //function on clicking edit book
  const editBookById = async (id, newTitle, newAuthor, newISBN, newBlurb) => {
    try {
      const input = {
        book: {
          title: newTitle,
          author: newAuthor,
          image: "https://tse1.explicit.bing.net/th?id=OIP.TF-ZDchnQgWskBRH8ZNu1gHaI6&pid=Api",
          isbn: newISBN,
          blurb: newBlurb
        }
      };
      const response = await axios.put(`http://localhost:8080/books/${id}`, input, { withCredentials: true });
      setSingleBook(response.data);
    } catch (e) {
      console.log(e)
    };
  };

  //function on Clicking Delete a Book
  const deleteBookById = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/books/${id}`, { withCredentials: true });

      // Esther to Alex: better get new axios request form db/ fetch books (mine/all) depending on where the user currently is
      const updatedBooks = books.filter((books) => {
        return books._id !== id;
      });
      setBooks(updatedBooks);
    } catch (e) {
      console.log(e)
    };
  }

  //function to map titles that adhere to search query coming from booklist>booksearch 
  const searchBook = (title) => {
    if (title && title.length > 1) {
      const searchBooksTitle = books.filter((books) => {
        return books.title.toLowerCase().includes(title.toLowerCase());
      });
      setSearchBooks(searchBooksTitle)
      if (searchBooksTitle.length == 0) {
        const searchBooksTitle = books.filter((books) => {
          return books.author.toLowerCase().includes(title.toLowerCase());
        });
        setSearchBooks(searchBooksTitle)

        if (searchBooksTitle.length == 0) {
          const searchBooksTitle = books.filter((books) => {
            return books.ISBN.includes(title);
          });
          setSearchBooks(searchBooksTitle)
        }
      }
    }
    else {
      setSearchBooks([])
    }

  }
  
  //get info on single book
  const bookInfo = async (bookIDNumber) => {
    
    const response = await axios.get(`http://localhost:8080/books/${bookIDNumber}`, { withCredentials: true });
    setSingleBook(response.data);
  }

  const valueToShare = {
    books,
    searchBooks,
    showBooks,
    handleFetchBooks,
    setBooks,
    editBookById,
    deleteBookById,
    createBook,
    searchBook,
    bookInfo,
    singleBook,
    setSingleBook
}

    return <BooksContext.Provider value={valueToShare}>
        { children }
    </BooksContext.Provider>

}

export { Provider };
export default BooksContext;