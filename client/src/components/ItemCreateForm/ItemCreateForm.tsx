import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '../../services/ItemServices';
import { logger } from '../../util/logger';
import './ItemCreateForm.scss';
import CategoryPicker from '../CategoryPicker/CategoryPicker';
import Button from '../Button/Button';
import { ItemCreateFormDataProps } from './ItemCreateFormTypes';
import Modal from '../Modal/Modal';

function ItemCreateForm() {
  //Handle book submit form changes and submit
  const [formData, setFormData] = useState<ItemCreateFormDataProps>({
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

  logger.log('confirmedTopCategory is:', confirmedTopCategory);
  const navigate = useNavigate();

  //load to invalidate all related data (e.g. itemList) exact: true makes sure not every query that starts with 'items' gets invalidated
  const queryClient = useQueryClient();
  //use createItem as mutation function
  const createItemMutation = useMutation({
    mutationKey: ['item', 'new'],
    mutationFn: createItem,
    onSuccess: (itemData) => {
      queryClient.setQueryData(['item', itemData.data[0]._id], itemData);
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
    // change the categories field of the formData
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
      } as ItemCreateFormDataProps;
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
      createItemMutation.mutate(formData);
      logger.log('data of create item mutation: ', createItemMutation);
      setWasSubmitTried(false);
    } else {
      setWasSubmitTried(true);
      logger.log('form data not ready for item creation ', formData);
    }
  };

  if (createItemMutation.status === 'pending') {
    return <p>New Item Loading</p>;
  }

  if (createItemMutation.status === 'error') {
    logger.error(
      'Error loading items! The Form data was:',
      formData,
      'the error was:',
      createItemMutation.error,
    );
    return <p>an error occured: {JSON.stringify(createItemMutation.error)}</p>;
  }

  //Book creation form
  return (
    <div>
      <h2>Create Item</h2>

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
            className="create-item-input__name"
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
            className="create-item-input__description"
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
            className="create-item-input__picture"
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
          Create!
        </Button>
      </form>
    </div>
  );
}

export default ItemCreateForm;
