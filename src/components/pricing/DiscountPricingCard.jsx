import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DiscountPricingCard.css';

const DiscountPricingCard = ({ plan, onSelect }) => {
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveCampaign();
  }, []);

  useEffect(() => {
    if (activeCampaign && plan.price) {
      calculateDiscount();
    }
  }, [activeCampaign, plan.price]);

  const fetchActiveCampaign = async () => {
    try {
      const response = await api.get('/api/admin/discount/campaigns/active');
      setActiveCampaign(response.data.campaign);
    } catch (error) {
      console.error('Error fetching active campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = async () => {
    try {
      const response = await api.post('/api/admin/discount/calculate-discount', {
        originalPrice: plan.price,
        campaignId: activeCampaign.id
      });
      setDiscountedPrice(response.data);
    } catch (error) {
      console.error('Error calculating discount:', error);
    }
  };

  const hasDiscount = activeCampaign && discountedPrice && discountedPrice.discountAmount > 0;

  return (
    <div 
      className={`pricing-card ${plan.featured ? 'featured' : ''} ${hasDiscount ? 'discount-mode' : ''}`}
      style={hasDiscount ? { '--campaign-color': activeCampaign.theme_color } : {}}
    >
      {hasDiscount && (
        <div className="discount-ribbon" style={{ background: activeCampaign.theme_color }}>
          {activeCampaign.badge_text || `${discountedPrice.discountPercentage}% OFF`}
        </div>
      )}

      {plan.featured && !hasDiscount && (
        <div className="featured-badge">
          Most Popular
        </div>
      )}

      <div className="plan-header">
        <h3 className="plan-name">{plan.name}</h3>
        <p className="plan-description">{plan.description}</p>
      </div>

      <div className="plan-pricing">
        {hasDiscount ? (
          <>
            <div className="original-price">
              <span className="currency">$</span>
              <span className="amount">{plan.price}</span>
              <span className="period">/{plan.period}</span>
            </div>
            <div className="discounted-price">
              <span className="currency">$</span>
              <span className="amount">{discountedPrice.finalPrice}</span>
              <span className="period">/{plan.period}</span>
            </div>
            <div className="savings-badge">
              Save ${discountedPrice.discountAmount}
            </div>
          </>
        ) : (
          <div className="regular-price">
            <span className="currency">$</span>
            <span className="amount">{plan.price}</span>
            <span className="period">/{plan.period}</span>
          </div>
        )}
      </div>

      {hasDiscount && activeCampaign.banner_text && (
        <div className="campaign-banner">
          {activeCampaign.banner_text}
        </div>
      )}

      <ul className="plan-features">
        {plan.features.map((feature, index) => (
          <li key={index} className="feature-item">
            <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button 
        className={`select-plan-btn ${hasDiscount ? 'discount-btn' : ''}`}
        onClick={() => onSelect(plan, discountedPrice)}
        style={hasDiscount ? { background: activeCampaign.theme_color } : {}}
      >
        {hasDiscount ? `Get ${discountedPrice.discountPercentage}% Off Now` : 'Select Plan'}
      </button>

      {hasDiscount && (
        <div className="limited-time">
          â° Limited time offer - Ends {new Date(activeCampaign.end_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default DiscountPricingCard;

