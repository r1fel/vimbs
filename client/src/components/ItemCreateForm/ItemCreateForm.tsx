import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { createItem } from '../../services/ItemServices';
import { logger } from '../../util/logger';
import './ItemCreateForm.scss';
import CategoryPicker from '../CategoryPicker/CategoryPicker';
import Button from '../Button/Button';

interface ItemCreateFormData {
  name: string;
  description: string;
  picture: string;
  categories: {
    HouseAndGarden?: {
      subcategories: [string];
    };
    ChildAndBaby?: {
      subcategories: [string];
    };
    MediaAndGames?: {
      subcategories: [string];
    };
    AdultClothing?: {
      subcategories: [string];
    };
    SportAndCamping?: {
      subcategories: [string];
    };
    Technology?: {
      subcategories: [string];
    };
    Other?: {
      subcategories: [string];
    };
  };
}

function ItemCreateForm() {
  //Handle book submit form changes and submit
  const [formData, setFormData] = useState<ItemCreateFormData>({
    name: '',
    description: '',
    picture: '',
    categories: {},
  });

  const [confirmedTopCategory, setConfirmedTopCategory] = useState(null);
  const [confirmedSubCategory, setConfirmedSubCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  useEffect(() => {
    // change the categories field of the formData
    const updateCategories = async () => {
      await setFormData((prevData) => ({
        ...prevData,
        categories: {
          [confirmedTopCategory]: {
            subcategories: [confirmedSubCategory],
          },
        },
      }));

      logger.log('the changed form data after setting categries is:', formData);
    };
    updateCategories();
  }, [confirmedSubCategory]);

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

      {
        // isCategoryModalOpen &&
        <CategoryPicker
          confirmedTopCategory={confirmedTopCategory}
          setConfirmedTopCategory={setConfirmedTopCategory}
          confirmedSubCategory={confirmedSubCategory}
          setConfirmedSubCategory={setConfirmedSubCategory}
          setIsCategoryModalOpen={setIsCategoryModalOpen}
        />
      }
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
          <p>
            category:
            {confirmedSubCategory && confirmedTopCategory
              ? Object.values(formData.categories)[0]?.subcategories
              : []}{' '}
            <Button onClick={() => setIsCategoryModalOpen(true)}>
              {confirmedSubCategory ? 'Change Category' : 'Set Category'}
            </Button>
          </p>
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
        <Button onClick={handleSubmit} className="button">
          Create!
        </Button>
      </form>
    </div>
  );
}

export default ItemCreateForm;
