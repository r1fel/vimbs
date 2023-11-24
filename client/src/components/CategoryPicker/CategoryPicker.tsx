import { useState } from 'react';

const CategoryPicker = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [isSubcategoryView, setSubcategoryView] = useState(false);

  const topCategories = ['Category A', 'Category B', 'Category C'];

  const subcategories = {
    'Category A': ['Subcategory A1', 'Subcategory A2'],
    'Category B': ['Subcategory B1', 'Subcategory B2'],
    'Category C': ['Subcategory C1', 'Subcategory C2'],
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSubcategoryView(true);
  };

  const handleSubcategoryClick = (subcategory) => {
    // Handle subcategory selection (you might want to do something with the selected subcategory)
    console.log(`Selected Subcategory: ${subcategory}`);
  };

  const handleBackClick = () => {
    setSubcategoryView(false);
    setSelectedCategory(null);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isSubcategoryView ? 'Subcategories' : 'Top Categories'}</h2>
        <ul>
          {isSubcategoryView && selectedCategory !== null
            ? subcategories[selectedCategory].map((subcategory) => (
                <li
                  key={`category-selecter-${subcategory}`}
                  onClick={() => handleSubcategoryClick(subcategory)}
                >
                  {subcategory}
                </li>
              ))
            : topCategories.map((category) => (
                <li
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </li>
              ))}
        </ul>
        <button onClick={handleBackClick} disabled={!isSubcategoryView}>
          Back
        </button>
        <button onClick={onClose}>Accept</button>
      </div>
    </div>
  );
};

export default CategoryPicker;
