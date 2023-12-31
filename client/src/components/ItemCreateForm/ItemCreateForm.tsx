import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { createItem } from '../../services/ItemServices';
import catchAsync from '../../util/catchAsync';
import { logger } from '../../util/logger';
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

  const navigate = useNavigate();
  //load to invalidate all related data (e.g. itemList) exact: true makes sure not every query that starts with 'items' gets invalidated
  const queryClient = useQueryClient();
  //use createItem as mutation function
  const createItemMutation = useMutation({
    mutationFn: createItem,
    onSuccess: (itemData) => {
      queryClient.setQueryData(['item', itemData.data[0]._id], itemData);
      queryClient.invalidateQueries(['item'], { exact: true });
      navigate(`/item/${itemData.data[0]._id}`);
    },
  });

  const handleChange = (event: any) => {
    const changedField = event.target.name;
    const newValue = event.target.value;
    setFormData((currData) => {
      currData[changedField] = newValue;
      return { ...currData };
    });
  };

  // call the mutation (takes objects only)
  const handleSubmit = (event: any) => {
    event.preventDefault();
    createItemMutation.mutate(formData);
    logger.log('data of create item mutation: ', createItemMutation);
  };

  if (createItemMutation.status === 'error') {
    logger.error('Error loading items:', createItemMutation.error);
    return <p>an error occured: {JSON.stringify(createItemMutation.error)}</p>;
  }
  if (createItemMutation.status === 'pending') {
    return <p>New Item Loading</p>;
  }

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
