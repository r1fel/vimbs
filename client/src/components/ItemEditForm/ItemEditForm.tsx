import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { fetchItems, editItem } from '../../services/ItemServices';
import { logger } from '../../util/logger';
import './ItemEditForm.scss';

interface ItemEditFormData {
  name: string;
  description: string;
  picture: string;
}

function ItemEditForm({ id }) {
  //Handle book submit form changes and submit

  // const { id } = useParams();

  const itemQuery = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItems(`item/${id}`),
  });

  useEffect(() => {
    if (itemQuery.isSuccess) {
      setFormData({
        name: itemQuery.data.data.name,
        description: itemQuery.data.data.description,
        picture: itemQuery.data.data.picture,
      });
    }

    console.log('there are the item details:', itemQuery?.data?.data || null);
  }, [itemQuery.status]);

  const [formData, setFormData] = useState<ItemEditFormData>({
    name: '',
    description: '',
    picture: '',
  });

  const navigate = useNavigate();
  //load to invalidate all related data (e.g. itemList) exact: true makes sure not every query that starts with 'items' gets invalidated
  const queryClient = useQueryClient();

  //use EditItem as mutation function
  const editItemMutation = useMutation({
    mutationFn: () => editItem(id, formData),
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
    editItemMutation.mutate(formData);
    logger.log('data of Edit item mutation: ', editItemMutation);
  };

  if (editItemMutation.status === 'error') {
    logger.error('Error loading items:', editItemMutation.error);
    return <p>an error occured: {JSON.stringify(editItemMutation.error)}</p>;
  }
  if (editItemMutation.status === 'pending') {
    return <p>New Item Loading</p>;
  }

  //Book creation form
  return (
    <div>
      <h2>Edit Item</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title </label>
          <input
            type="text"
            placeholder="name"
            className="Edit-item-input__name"
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
            className="Edit-item-input__description"
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
            className="Edit-item-input__picture"
            value={formData.picture}
            onChange={handleChange}
            name="picture"
            id="picture"
          />
        </div>
        <button onClick={handleSubmit} className="button">
          Edit!
        </button>
      </form>
    </div>
  );
}

export default ItemEditForm;
