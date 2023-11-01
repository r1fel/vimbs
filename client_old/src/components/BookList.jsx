import BookShow from './BookShow'
import { useContext } from 'react';
import BooksContext from '../context/books';

function BookList() {

    const { books, searchBooks, showBooks, handleFetchBooks } = useContext(BooksContext);
    
    if(books === "sign in please"){
       handleFetchBooks("mine");
    }
    else{
    //render all books in books array
    let renderedBooks = books.map((book) => {
        return <BookShow key={book._id} book={book} />;
    });

    //render books that adhere to search query if there are any 
    if (searchBooks.length > 0) {
        renderedBooks = searchBooks.map((book) => {
            return <BookShow key={book._id} book={book} />;
        });
    }

    if (showBooks === "all") {
        pageTitle = 'Browse Books - that are not on your bookshelf';
    }
    
    return (<div>
        <div className="book-list">{renderedBooks}</div>
    </div>
    )
    };
}

export default BookList;