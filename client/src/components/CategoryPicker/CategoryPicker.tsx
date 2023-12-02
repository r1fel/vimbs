import { useEffect, useState } from 'react';
import './CategoryPicker.scss';
import {
  CategoryPickerProps,
  TopCategories,
  SubCategories,
} from './CategoryPickerTypes';
import { logger } from '../../util/logger';
import { IoCheckmarkCircle } from 'react-icons/io5';
import Button from '../Button/Button';

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  setConfirmedTopCategory,
  setConfirmedSubCategory,
  setIsCategoryModalOpen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null,
  );
  const [isSubCategoryView, setSubCategoryView] = useState<boolean>(false);

  const topCategories: TopCategories = {
    HouseAndGarden: 'Haus und Garten',
    ChildAndBaby: 'Kind und Baby',
    MediaAndGames: 'Medien und Spiele',
    AdultClothing: 'Mode',
    SportAndCamping: 'Sport und Camping',
    Technology: 'Technik und Zubehör',
    Other: 'Sonstiges',
  };

  const subCategories: SubCategories = {
    HouseAndGarden: [
      'Baustellengeräte',
      'Deko',
      'Gartengeräte',
      'Garten- und Partymoebel',
      'Haushalts- und Küchengeräte',
      'Schutzkleidung',
      'Werkzeuge',
      'Sonstiges',
    ],
    ChildAndBaby: ['Kleidung', 'Spielzeug', 'Zubehör', 'Sonstiges'],
    MediaAndGames: [
      'Bücher',
      'Gesellschaftsspiele (Brett- und Kartenspiele)',
      'Fachbücher (Schule und Studium)',
      'Filme',
      'Videospiele',
      'Sonstiges',
    ],
    AdultClothing: [
      'Damenkleidung',
      'Damenschuhe',
      'Herrenkleidung',
      'Herrenschuhe',
      'Sonstiges',
    ],
    SportAndCamping: [
      'Campingutensilien',
      'Fitnessgeräte',
      'Outdoorkleidung',
      'Wintersport',
      'Sonstiges',
    ],
    Technology: [
      'Audio & Hifi',
      'Computer und Zubehör',
      'Kameras und Zubehör',
      'Konsolen',
      'TV, Beamer und Zubehör',
      'Sonstiges',
    ],
    Other: ['Sonstiges'],
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSubCategoryView(true);
  };

  const handleSubCategoryClick = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    console.log(`Selected Subcategory: ${subCategory}`);
  };

  const handleBackClick = () => {
    setSubCategoryView(false);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const handleCancelClick = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setConfirmedSubCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleAcceptClick = () => {
    setConfirmedSubCategory(selectedSubCategory);
    setConfirmedTopCategory(selectedCategory);
    setIsCategoryModalOpen(false);
  };

  useEffect(() => {
    logger.log('selected category is:', selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="category-picker">
      <div className="category-picker__content">
        <h3>{isSubCategoryView ? 'Subcategories' : 'Categories'}</h3>
        <ul className="category-picker__list">
          {isSubCategoryView &&
          selectedCategory !== null &&
          subCategories[selectedCategory]
            ? subCategories[selectedCategory].map((subCategory) => (
                <li
                  key={subCategory}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  className="category-picker__category"
                >
                  {subCategory}
                  {subCategory === selectedSubCategory ? (
                    <IoCheckmarkCircle />
                  ) : null}
                </li>
              ))
            : Object.keys(topCategories).map((category) => (
                <li
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="category-picker__category"
                >
                  {topCategories[category]}
                </li>
              ))}
        </ul>
        {isSubCategoryView ? (
          <Button onClick={handleBackClick}>Back</Button>
        ) : (
          <Button onClick={handleCancelClick}>Cancel</Button>
        )}
        {selectedSubCategory !== null ? (
          <Button onClick={handleAcceptClick}>Accept</Button>
        ) : null}
      </div>
    </div>
  );
};

export default CategoryPicker;
