import { useState, useContext } from 'react';
import BooksContext from '../context/books';


function BookSearch() {

    const { searchBook } = useContext(BooksContext);

    //Handle search querys coming in via the booksearch form
    const [formData, setFormData] = useState({ title: "" });

    const handleChange = (event) => {
        const changedField = event.target.name;
        const newValue = event.target.value;
        setFormData(currData => {
            currData[changedField] = newValue;
            return { ...currData };
        })
        searchBook(formData.title)
        console.log(formData)
    }

    //Book search form
    return (<div>

        <form className="searchForm">
            <p>
                <input
                    type="text"
                    placeholder="Title, Author or ISBN"
                    className="searchBar"
                    value={formData.title}
                    onChange={handleChange}
                    name="title"
                    id="title"
                />
            </p>
        </form>

    </div>)
}

export default BookSearch;