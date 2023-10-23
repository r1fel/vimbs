import BookLink from './Navigation/Link';

function BookShow({ book }) {

    //let bookCover = 'https://covers.openlibrary.org/b/isbn/'.concat(book.isbn,'-M.jpg');
  
    let content = <div key={book._id}>
        <BookLink key={book._id} to={book._id}><img className='bookCover' src = {book.image} /><p><b>{book.title}</b></p></BookLink>
    </div>
        ;

    let borrowRequestLabel = <></>;

    if(book.owner && !book.available){
        borrowRequestLabel = <div className = "borrowRequestLabel">Active Borrow Request</div>
    }

    //Show book for each book
    return <div className="book-show">
        {content}
        {borrowRequestLabel}
    </div>
}

export default BookShow;