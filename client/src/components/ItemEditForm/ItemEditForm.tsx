import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchItems, editItem } from '../../services/ItemServices';
import { logger } from '../../util/logger';
import './ItemEditForm.scss';
import { ItemEditFormDataProps } from './ItemEditFormTypes';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import CategoryPicker from '../CategoryPicker/CategoryPicker';

function ItemEditForm({ id }: { id: string }) {
  const itemQuery = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItems(`item/${id}`),
  });

  useEffect(() => {
    if (itemQuery.isSuccess) {
      logger.log('edit item query:', itemQuery);
      setFormData({
        name: itemQuery.data.data[0].name,
        description: itemQuery.data.data[0].description,
        picture: itemQuery.data.data[0].picture,
        categories: itemQuery.data.data[0].categories,
      });
    }

    console.log('there are the item details:', itemQuery?.data?.data || null);
  }, [itemQuery.status]);

  const [formData, setFormData] = useState<ItemEditFormDataProps>({
    name: '',
    description: '',
    picture: '',
    categories: {},
  });

  const [confirmedTopCategory, setConfirmedTopCategory] = useState<
    string | null
  >(null);
  const [confirmedSubCategory, setConfirmedSubCategory] = useState<
    string | null
  >(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] =
    useState<boolean>(false);
  const [wasSubmitTried, setWasSubmitTried] = useState<boolean>(false);

  const navigate = useNavigate();
  //load to invalidate all related data (e.g. itemList) exact: true makes sure not every query that starts with 'items' gets invalidated
  const queryClient = useQueryClient();

  //use EditItem as mutation function
  const editItemMutation = useMutation({
    mutationFn: () => editItem(id, formData),
    onSuccess: (itemData) => {
      queryClient.setQueryData(
        ['item', itemData.data[0]._id],
        itemData.data[0],
      );
      queryClient.invalidateQueries(['item'], { exact: true });
      navigate(`/item/${itemData.data[0]._id}`);
    },
  });

  const errors = {
    name: 'name is required',
    description: 'description is required',
    picture: 'picture is required',
    categories: 'please pick a category',
  };

  useEffect(() => {
    // change the categories field of the formData only when the confirmedSubCategory is set
    const updateCategories = async () => {
      if (confirmedTopCategory !== null) {
        setFormData((prevData) => ({
          ...prevData,
          categories: {
            [confirmedTopCategory as string]: {
              subcategories: [confirmedSubCategory],
            },
          },
        }));
      }
      logger.log('the changed form data after setting categries is:', formData);
    };
    updateCategories();
  }, [confirmedSubCategory]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changedField = event.target.name;
    const newValue = event.target.value;
    setFormData((currData) => {
      return {
        ...currData,
        [changedField]: newValue,
      } as ItemEditFormDataProps;
    });
  };

  // call the mutation (takes objects only)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      formData.name &&
      formData.description &&
      formData.picture &&
      confirmedSubCategory
    ) {
      event.preventDefault();
      editItemMutation.mutate(formData);
      logger.log('data of Edit item mutation: ', editItemMutation);
    } else {
      setWasSubmitTried(true);
      logger.log('form data not ready for item creation ', formData);
    }
  };

  if (editItemMutation.status === 'pending') {
    return <p>New Item Loading</p>;
  }

  if (editItemMutation.status === 'error') {
    logger.error('Error loading items:', editItemMutation.error);
    return <p>an error occured: {JSON.stringify(editItemMutation.error)}</p>;
  }

  return (
    <div>
      <h2>Edit Item</h2>
      {isCategoryModalOpen && (
        <Modal isOpen={isCategoryModalOpen}>
          <CategoryPicker
            setConfirmedTopCategory={setConfirmedTopCategory}
            setConfirmedSubCategory={setConfirmedSubCategory}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
          />
        </Modal>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title </label>
          <input
            type="text"
            placeholder="name"
            className="edit-item-input__name"
            value={formData.name}
            onChange={handleChange}
            name="name"
            id="name"
          />
          {!formData.name && wasSubmitTried && (
            <p className="create-item-error">{errors.name}</p>
          )}
        </div>
        <div>
          <label>description</label>
          <input
            type="text"
            placeholder="description"
            className="edit-item-input__description"
            value={formData.description}
            onChange={handleChange}
            name="description"
            id="description"
          />
          {!formData.description && wasSubmitTried && (
            <p className="create-item-error">{errors.description}</p>
          )}
        </div>
        <div>
          <p>
            category:
            {confirmedSubCategory && confirmedTopCategory
              ? `${confirmedTopCategory} / ${
                  Object.values(formData.categories)[0]?.subcategories
                }`
              : null}{' '}
            <Button onClick={() => setIsCategoryModalOpen(true)}>
              {confirmedSubCategory ? 'Change Category' : 'Set Category'}
            </Button>
          </p>
          {!confirmedSubCategory && wasSubmitTried && (
            <p className="create-item-error">{errors.categories}</p>
          )}
        </div>
        <div>
          <label>picture</label>
          <input
            type="text"
            placeholder="image URL"
            className="edit-item-input__picture"
            value={formData.picture}
            onChange={handleChange}
            name="picture"
            id="picture"
          />
          {!formData.picture && wasSubmitTried && (
            <p className="create-item-error">{errors.picture}</p>
          )}
        </div>
        <Button type="submit" className="button">
          Update Item!
        </Button>
      </form>
    </div>
  );
}

export default ItemEditForm;
