import {useState} from 'react';

function ItemCreateForm() {
  //Handle book submit form changes and submit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    picture: '',
  });

  const handleChange = (event) => {
    const changedField = event.target.name;
    const newValue = event.target.value;
    setFormData((currData) => {
      currData[changedField] = newValue;
      return {...currData};
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData.name, formData.picture, formData.description);
  };

  //Book creation form
  return (
    <div>
      <h2>Create Item</h2>
      <form onSubmit={handleSubmit}>
        <p>
          <label>Title </label>
          <input
            type="text"
            placeholder="title"
            className="input"
            value={formData.title}
            onChange={handleChange}
            name="title"
            id="title"
          />
        </p>
        <p>
          <label>Author </label>
          <input
            type="text"
            placeholder="author"
            className="input"
            value={formData.author}
            onChange={handleChange}
            name="author"
            id="author"
          />
        </p>
        <p>
          <label>ISBN </label>
          <input
            type="text"
            placeholder="ISBN"
            className="input"
            value={formData.isbn}
            onChange={handleChange}
            name="isbn"
            id="isbn"
          />
        </p>
        <p>
          <label>Blurb </label>
          <input
            type="text"
            placeholder="blurb"
            className="input"
            value={formData.blurb}
            onChange={handleChange}
            name="blurb"
            id="blurb"
          />
        </p>
        <button onClick={handleSubmit} className="button">
          Create!
        </button>
      </form>
    </div>
  );
}

export default ItemCreateForm;
