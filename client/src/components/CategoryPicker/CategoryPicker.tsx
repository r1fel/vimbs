import { useEffect, useState } from 'react';
import './CategoryPicker.scss';
import { logger } from '../../util/logger';
import { IoCheckmarkCircle } from 'react-icons/io5';

const CategoryPicker = ({
  setConfirmedTopCategory,
  setConfirmedSubCategory,
  setIsCategoryModalOpen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [isSubCategoryView, setSubCategoryView] = useState(false);

  const topCategories = {
    HouseAndGarden: 'Haus und Garten',
    ChildAndBaby: 'Kind und Baby',
    MediaAndGames: 'Medien und Spiele',
    AdultClothing: 'Mode',
    SportAndCamping: 'Sport und Camping',
    Technology: 'Technik und Zubehör',
    Other: 'Sonstiges',
  };

  const subCategories = {
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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSubCategoryView(true);
  };

  const handleSubCategoryClick = (subCategory) => {
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
    <div className="modal">
      <div className="modal-content">
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
        <button onClick={handleBackClick} disabled={!isSubCategoryView}>
          Back
        </button>
        {selectedSubCategory !== null ? (
          <button onClick={handleAcceptClick}>Accept</button>
        ) : null}
      </div>
    </div>
  );
};

export default CategoryPicker;
