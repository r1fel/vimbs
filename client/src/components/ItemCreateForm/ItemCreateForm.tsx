import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {createItem} from '../../services/ItemServices';
import catchAsync from '../../util/catchAsync';
import {logger} from '../../util/logger';
import './ItemCreateForm.scss';

interface ItemCreateFormData {
  name: string;
  description: string;
  picture: string;
}

function ItemCreateForm() {
  //Handle book submit form changes and submit
  const [formData, setFormData] = useState<ItemCreateFormData>({
    name: '',
    description: '',
    picture: '',
  });

  logger.log(formData);

  const navigate = useNavigate();

  const handleChange = (event: any) => {
    const changedField = event.target.name;
    const newValue = event.target.value;
    setFormData((currData) => {
      currData[changedField] = newValue;
      return {...currData};
    });
  };

  const handleSubmit = catchAsync(async (event: any) => {
    event.preventDefault();
    const item = await createItem(
      formData.name,
      formData.description,
      formData.picture,
    );
    logger.log('created item is:', item);
    logger.log('navigate to:', item.data[0]._id);
    navigate(`/item/${item.data[0]._id}`);
  });

  //Book creation form
  return (
    <div>
      <h2>Create Item</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title </label>
          <input
            type="text"
            placeholder="name"
            className="create-item-input__name"
            value={formData.name}
            onChange={handleChange}
            name="name"
            id="name"
          />
        </div>
        <div>
          <label>description</label>
          <input
            type="text"
            placeholder="description"
            className="create-item-input__description"
            value={formData.description}
            onChange={handleChange}
            name="description"
            id="description"
          />
        </div>
        <div>
          <label>picture</label>
          <input
            type="text"
            placeholder="image URL"
            className="create-item-input__picture"
            value={formData.picture}
            onChange={handleChange}
            name="picture"
            id="picture"
          />
        </div>
        <button onClick={handleSubmit} className="button">
          Create!
        </button>
      </form>
    </div>
  );
}

export default ItemCreateForm;
