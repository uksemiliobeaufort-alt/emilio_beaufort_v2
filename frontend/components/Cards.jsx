import React from 'react';
import './Cards.css';

const products = [
  {
    id: 1,
    name: 'Cleanser',
    price: '$45',
    image: '/images/product1.jpg',
  },
  {
    id: 2,
    name: 'Gift',
    price: '$100',
    image: '/images/product2.jpg',
  },
  {
    id: 3,
    name: 'shirt',
    price: '$134',
    image: '/images/product3.jpg',
  },
];

const Cards = () => {
  return (
    <div className="gallery-container">
      {products.map(product => (
        <div key={product.id} className="card">
          <img src={product.image} alt={product.name} className="product-img" />
          <div className="caption">
            <p>{product.name}</p>
            <p className="price">{product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cards;
