import { useState, useContext } from 'react';
import BookCreateForm from './BookCreateForm';
import BooksContext from '../context/books';


function BookCreate() {

  const { createBook } = useContext(BooksContext);

  //Handle submit from the bookcreate form
  const handleSubmit = (title, author, ISBN, blurb) => {
    createBook(title, author, ISBN, blurb);
    setShowForm(false);
  };

  //Handle showing the bookcreateform when button is pressed
  const [showForm, setShowForm] = useState(false);

  const handleShow = () => {
    setShowForm(!showForm);
  }

  //Show button for the book creation form, when form is closed
  let content = <div><button className="buttonBookCreate" onClick={handleShow}> Add a Book </button></div>

  //if statement to call on bookcreateform
  if (showForm) {
    content = <BookCreateForm onSubmit={handleSubmit} onClick={handleShow} />;
  }

  return (<div>
    {content}
  </div>
  )
}

export default BookCreate;