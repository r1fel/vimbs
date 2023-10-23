import { useState, useContext } from 'react';
import BorrowLendContext from '../context/borrowLend';
import BooksContext from '../context/books';

function BorrowRequester({bookData}) {

    const { bookInfo } = useContext(BooksContext);
    const { handleLend } = useContext(BorrowLendContext);
    const [showBorrowRequestfield, setShowBorrowRequestfield] = useState(true);
    
    //Handle borrow test buttons
    const handleLendClick = async () => {
        const response = await handleLend(bookData._id, formData.message);
        bookInfo(response._id);
        setShowBorrowRequestfield(false);
    };
   
    //handle formdata of messagefield
    const [formData, setFormData] = useState({ message: "Hi I would like to borrow this book, please send it to my address: "});

    const handleChange = (event) => {
        const changedField = event.target.name;
        const newValue = event.target.value;
        setFormData(currData => {
            currData[changedField] = newValue;
            return { ...currData };
        })
    };

    let borrowRequest = <></>;
    
    //show borrowrequest text field and submit button
    if(showBorrowRequestfield === true){
        borrowRequest = <p className='messageField'>
            <input id="borrowRequester" className="input" value={formData.message} onChange={handleChange} name="message" />
            <button className="borrow" onClick={handleLendClick}>Request Borrow</button>
        </p>
    };

    return <div>
        {borrowRequest}
    </div>
}

export default BorrowRequester;