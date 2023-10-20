import { useState, useContext } from 'react';
import BooksContext from '../context/books';


function BookEdit({ book, onSubmit }) {

    const { editBookById } = useContext(BooksContext);

    //Handle BookEdit change
    const [formData, setFormData] = useState({ title: book.title, author: book.author, isbn: book.isbn, blurb: book.blurb });

    const handleChange = (event) => {
        const changedField = event.target.name;
        const newValue = event.target.value;
        setFormData(currData => {
            currData[changedField] = newValue;
            return { ...currData };
        })

    }

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit();
        editBookById(book._id, formData.title, formData.author, formData.isbn, formData.blurb);
    };

    //Bookedit form
    return <form onSubmit={handleSubmit} className="bookEdit">
        <p>
            <img className='bookCover' src={book.image} />
        </p>
        <p>
            <label>Title</label>
            <input className="input" value={formData.title} onChange={handleChange} name="title" />
        </p>
        <p>
            <label>Author</label>
            <input className="input" value={formData.author} onChange={handleChange} name="author" />
        </p>
        <p>
            <label>ISBN</label>
            <input className="input" value={formData.isbn} onChange={handleChange} name="isbn" />
        </p>
        <p>
            <label>Blurb</label>
            <input className="input" value={formData.blurb} onChange={handleChange} name="blurb" />
        </p>
        <button className="button is-primary">
            Save
        </button>
    </form>
}

export default BookEdit;