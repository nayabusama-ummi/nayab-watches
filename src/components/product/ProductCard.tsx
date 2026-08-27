import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../data/products';
import { ArrowRight } from 'lucide-react';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  theme?: 'dark' | 'light';
  layout?: 'standard' | 'editorial-split' | 'featured';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  theme = 'light',
  layout = 'standard',
}) => {
  return (
    <article
      className={`product-card product-card--${theme} product-card--${layout}`}
    >
      <Link to={`/watches/${product.slug}`} className="product-card__link" aria-label={`View ${product.name}`}>
        <div className="product-card__image-container">
          <img
            src={product.heroImage}
            alt={`${product.name} - ${product.material}`}
            className="product-card__image product-card__image--primary"
            loading="lazy"
            width="600"
            height="700"
          />
          {product.sideImage && (
            <img
              src={product.sideImage}
              alt={`${product.name} alternate view`}
              className="product-card__image product-card__image--secondary"
              loading="lazy"
              width="600"
              height="700"
            />
          )}
          <div className="product-card__discover-overlay">
            <span className="product-card__discover-text">
              Discover Timepiece <ArrowRight size={13} />
            </span>
          </div>
        </div>

        <div className="product-card__content">
          <span className="product-card__collection">{product.collection}</span>
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__specs">
            {product.material} · {product.size}
          </p>
          <p className="product-card__price">{product.formattedPrice}</p>
        </div>
      </Link>
    </article>
  );
};
