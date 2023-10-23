import BookEdit from './BookEdit';
import { useState, useContext, useEffect } from 'react';
import BooksContext from '../context/books';
import NavigationContext from '../context/navigation';
import BorrowLog from './BorrowLog';
import BorrowRequester from './BorrowRequester';


function BookShowSingle() {

    const { deleteBookById, singleBook } = useContext(BooksContext);
    const { navigate } = useContext(NavigationContext);
    const [borrowLog, setBorrowLog] = useState();
    const [borrowRequester, setBorrowRequester] = useState();
    const [dueDate, setDueDate] = useState();

    //Handle the edit menu for every book
    const [showEdit, setShowEdit] = useState(false);

    const handleDeleteClick = () => {
        deleteBookById(singleBook._id);
        navigate("/mybooks");      
    }

    const handleEditClick = () => {
        setShowEdit(!showEdit);
    };

    //Handle submissions for edits
    const handleSubmit = () => {
        setShowEdit(false);
    }


    //Show the book as object
    let content = <div className = "singleBookPage" key={singleBook._id}><p><img className='bookCover' src={singleBook.image} /></p><b>{singleBook.title}</b><p>{singleBook.author}</p>{singleBook.isbn}<p>{singleBook.blurb}</p></div>
    let actions = <></>;

    useEffect(() => {
        if(!singleBook.dueDate){
            setDueDate(<p className = "dueDate">Available</p>);
        }else{
            let dueDateSplit = singleBook.dueDate.split("T");
            setDueDate(<p className = "dueDate">Due Date: {dueDateSplit[0]}</p>);
        };
    },[singleBook]);
    
    
    if (singleBook.owner){
    actions =
        <div className="actions">
            <p>
                <button className="edit" onClick={handleEditClick}>
                    Edit
                </button>
                <button className="delete" onClick={handleDeleteClick}>
                    Delete
                </button>
            </p>
        </div>
        };


    useEffect(() => {
        if(Object.keys(singleBook).length > 0){
            if(singleBook.borrowingrequests){
                if(singleBook.borrowingrequests.length > 0){
                    setBorrowRequester(<></>);
                    setBorrowLog(<BorrowLog bookData={singleBook}/>);       
                }else{
                    setBorrowLog(<></>);
                };
            }else if(!singleBook.owner){
                setBorrowRequester(<BorrowRequester bookData={singleBook} />)
            };
        };
    }, [singleBook])  
       
    

    if (showEdit) {
        content = <BookEdit onSubmit={handleSubmit} book={singleBook} />;
        actions = <></>;
    }

    //Show book or edit menu for each book{borrowLog}{actions}
    return <div>
        {content}
        {dueDate}
        {actions}
        {borrowRequester}
        {borrowLog}
    </div>
}

export default BookShowSingle;