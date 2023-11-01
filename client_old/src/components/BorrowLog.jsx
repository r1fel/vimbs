import { useState, useContext, useEffect } from 'react';
import moment from 'moment';
import BooksContext from '../context/books';
import BorrowLendContext from '../context/borrowLend';



function BorrowLog({bookData}) {

    //get needed contexts and create states
    const { bookInfo } = useContext(BooksContext);
    const { handleBorrowRequest, acceptLend, declineLend, getBorrowMessages, borrowMessages, resetLend } = useContext(BorrowLendContext);
    const [showBorrowActionButtons, setShowBorrowActionButtons] = useState(false);
    const [showMessenger, setShowMessenger] = useState(false);
    const [showDueDateField, setShowDueDateField] = useState(false);
    const [showReturnButton, setShowReturnButton] = useState(false);
    const [showReturnedButton, setShowReturnedButton] = useState(false);

     //create variables for divs
     let message = <></>;
     let dueDateField = <></>;
     let messenger = <></>;
     let borrowAction = <></>;
     let borrowRequest = <></>;
     let dueDate = bookData.dueDate;
     let returnButton = <></>;

    //handel cancelling a borrow request by borrower
    const handleCancelClick = async () => {
        const response = await handleBorrowRequest(bookData._id, bookData.borrowingrequests[0]._id, "REQUEST CANCELLED","declined","");
        bookInfo(response._id);
    };

    // if needed, this can be used to create a reset button, add {resetButton} to the returned div at the bottom
    // const handleResetClick = async () => {
    //     const response = await resetLend(bookData._id);
    //     bookInfo(response._id);
    // };
     //const resetButton = <p><button className="Reset" onClick={handleResetClick}>Reset</button></p>


    //accept borrow request by lender
    const handleAcceptLendClick = async () => {
        const response = await acceptLend(bookData._id, bookData.borrowingrequests[0]._id);
        setShowBorrowActionButtons(false);
        getBorrowMessages(response);
    };

    //decline borrow request by lender
    const handleDeclineLendClick = async () => {
        const response = await declineLend(bookData._id, bookData.borrowingrequests[0]._id);
        setShowBorrowActionButtons(false);
        getBorrowMessages(response);
    };

    //handle sending messages when book is borrowed
    const handleMessageClick = async () => {
        if(!bookData.owner){
            const response = await handleBorrowRequest(bookData._id, bookData.borrowingrequests[0]._id,formData.messenger,"atB","");
            bookInfo(response._id);
        }else{
            const response = await handleBorrowRequest(bookData._id, bookData.borrowingrequests[0]._id, formData.messenger,"atB",formData.dueDate);
            bookInfo(response._id);
            setFormData({ messenger: "" });
        }
        setFormData({ messenger: "" });
    };

    //handle request to returning the book
    const handleReturnClick = async () => {
        if(!bookData.owner){
            const response = await handleBorrowRequest(bookData._id, bookData.borrowingrequests[0]._id,"Done reading, will send the book back","transferBtoL","transferBtoL",bookData.dueDate);
        }else{
            const response = await handleBorrowRequest(bookData._id, bookData.borrowingrequests[0]._id,"Need the book back, please return it before the new due date","transferBtoL",moment().format('YYYY-MM-DD'));
            bookInfo(response._id);
        }
    }

    //when book is returned handle closing chatlog and cleaning up
    const handleReturnedClick = async () => {    
        const response = await handleBorrowRequest(bookData._id, bookData.borrowingrequests[0]._id,"Got the book back - thanks - hope you enjoyed the book","backHome","");
        bookInfo(response._id);  
        const response2 = await resetLend(bookData._id);
    }

    //formdata for message fields and duedate field
    const [formData, setFormData] = useState({ messenger: "", dueDate: dueDate });

    const handleChange = (event) => {
        const changedField = event.target.name;
        const newValue = event.target.value;
        setFormData(currData => {
            currData[changedField] = newValue;
            return { ...currData };
        })
    }
    
    //useEffect to show or hide the different buttons and message field, according to the status of the borrowrequest
    useEffect(() =>{
        if(bookData.borrowingrequests){
            if(Object.keys(bookData.borrowingrequests).length > 0){  
                dueDate =  bookData.dueDate.split("T");
                setFormData({ message: "Hi I would like to borrow this book", messenger: "", dueDate: dueDate[0] }); 
                    if(bookData.borrowingrequests[0].bookLocation == "home" && bookData.owner){
                        setShowBorrowActionButtons(true);   
                    }
                    getBorrowMessages(bookData);
                    if(bookData.borrowingrequests[0].bookLocation == "transferLtoB" && !bookData.owner){
                        setShowMessenger(true);
                    }
                    if(bookData.borrowingrequests[0].bookLocation == "atB"){
                        setShowMessenger(true);
                        setShowReturnButton(true);
                    }
                    if(bookData.borrowingrequests[0].bookLocation == "atB" && bookData.owner){
                        setShowDueDateField(true);
                    }
                    if(bookData.borrowingrequests[0].bookLocation == "transferBtoL" && bookData.owner){
                        setShowReturnedButton(true);
                    }
                    if(bookData.borrowingrequests[0].bookLocation == "declined" && bookData.owner){
                        setShowReturnedButton(true);
                    }
               }
        }
    },[bookData])
    
    //variable for printing the messagelog
    message = <div className = "messenger">{borrowMessages}</div>

    //show accept and decline buttons when borrowrequest comes in at lender
    if(bookData.borrowingrequests[0].bookLocation === "home" && showBorrowActionButtons){
        borrowAction = <div className="borrowActions">
                <button className="accept" onClick={handleAcceptLendClick}>Accept</button>
                <button className="decline" onClick={handleDeclineLendClick}>Decline</button>
            </div> 
    }

    //show input field for sending messages
    if(showMessenger){
        messenger = <p className="messageField"><input className="input" id="borrowMessenger" value={formData.messenger} onChange={handleChange} name="messenger" />
        <button className="borrow" onClick={handleMessageClick}>Send</button></p>
    }
    
    //show cancel borrow field for sending messages
    if (!bookData.owner && bookData.borrowingrequests[0].bookLocation != "atB") {
        borrowAction = <div className="actions">
        <p>
            <button className="cancel" onClick={handleCancelClick}>
                Cancel Borrow
            </button>
        </p>
    </div>
    };  
    
    //show duedate field at lender page for adjusting the due date
    if(showDueDateField === true){
        dueDateField = <p className = "dueDateField">
           <input type="date" id="dueDate" name="dueDate" value={formData.date} min={moment().format('YYYY-MM-DD')} max="2050-12-31" onChange={handleChange} />
        </p>
    }

    //add return button for requesting the book to be returned when borrowed
    if(showReturnButton === true){
        returnButton =
        <p className='returnButtons'>
            <button className="borrow" onClick={handleReturnClick}>Return Book</button>
        </p>
    }

    //show returned button when book is on route back to lender
    if(showReturnedButton === true){
        returnButton =
        <p className='returnButtons'>
            <button className="borrow" onClick={handleReturnedClick}>Book Returned</button>
        </p>
    }

    //div for showing on BookShowSingle page under book info
    return <div>
        {borrowRequest}
        {message}
        {messenger}
        {dueDateField}
        {borrowAction}
        {returnButton}
    </div>
}

export default BorrowLog;