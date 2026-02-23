import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DiscountCampaignManager.css';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const DiscountCampaignManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'custom',
    discount_type: 'percentage',
    discount_value: '',
    applies_to_all_plans: true,
    applicable_plan_types: [],
    start_date: '',
    end_date: '',
    theme_color: '#FF6B6B',
    banner_text: '',
    badge_text: '',
    requires_coupon: false,
    coupon_code: '',
    max_uses: '',
    max_uses_per_user: 1
  });
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/api/admin/discount/campaigns');
      setCampaigns(response.data?.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCampaign) {
        await api.put(
          `/api/admin/discount/campaigns/${editingCampaign.id}`,
          formData
        );
      } else {
        await api.post(
          '/api/admin/discount/campaigns',
          formData
        );
      }

      fetchCampaigns();
      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleActivate = async (campaignId) => {
    try {
      await api.post(
        `/api/admin/discount/campaigns/${campaignId}/activate`
      );
      fetchCampaigns();
    } catch (error) {
      console.error('Error activating campaign:', error);
    }
  };

  const handleDeactivate = async (campaignId) => {
    try {
      await api.post(
        `/api/admin/discount/campaigns/${campaignId}/deactivate`
      );
      fetchCampaigns();
    } catch (error) {
      console.error('Error deactivating campaign:', error);
    }
  };

  const handleDelete = async (campaignId) => {
    const ok = await confirmDialog({ title: 'Delete Campaign', message: 'Are you sure you want to delete this campaign?', confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;

    try {
      await api.delete(
        `/api/admin/discount/campaigns/${campaignId}`
      );
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      campaign_type: campaign.campaign_type,
      discount_type: campaign.discount_type,
      discount_value: campaign.discount_value,
      applies_to_all_plans: campaign.applies_to_all_plans,
      applicable_plan_types: campaign.applicable_plan_types || [],
      start_date: campaign.start_date.split('T')[0],
      end_date: campaign.end_date.split('T')[0],
      theme_color: campaign.theme_color,
      banner_text: campaign.banner_text,
      badge_text: campaign.badge_text,
      requires_coupon: campaign.requires_coupon,
      coupon_code: campaign.coupon_code || '',
      max_uses: campaign.max_uses || '',
      max_uses_per_user: campaign.max_uses_per_user
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      campaign_type: 'custom',
      discount_type: 'percentage',
      discount_value: '',
      applies_to_all_plans: true,
      applicable_plan_types: [],
      start_date: '',
      end_date: '',
      theme_color: '#FF6B6B',
      banner_text: '',
      badge_text: '',
      requires_coupon: false,
      coupon_code: '',
      max_uses: '',
      max_uses_per_user: 1
    });
    setEditingCampaign(null);
  };

  const getCampaignTypeIcon = (type) => {
    const icons = {
      black_friday: '🛍️',
      cyber_monday: '💻',
      new_year: '🎉',
      summer_sale: '☀️',
      custom: '🎯'
    };
    return icons[type] || '🎯';
  };

  if (loading) {
    return <div className="loading">Loading campaigns...</div>;
  }

  return (
    <div className="discount-campaign-manager">
      <div className="manager-header">
        <h1>🎨 Discount Campaign Manager</h1>
        <button 
          className="btn-create"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          + Create Campaign
        </button>
      </div>

      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <div 
            key={campaign.id} 
            className={`campaign-card ${campaign.is_active ? 'active' : ''}`}
          >
            <div className="campaign-header">
              <div className="campaign-icon">
                {getCampaignTypeIcon(campaign.campaign_type)}
              </div>
              <div className="campaign-status">
                {campaign.is_active && <span className="badge active">ACTIVE</span>}
                {campaign.is_featured && <span className="badge featured">FEATURED</span>}
              </div>
            </div>

            <h3>{campaign.name}</h3>
            <p className="campaign-description">{campaign.description}</p>

            <div className="campaign-details">
              <div className="detail-item">
                <span className="label">Discount:</span>
                <span className="value">
                  {campaign.discount_type === 'percentage' 
                    ? `${campaign.discount_value}%` 
                    : `$${campaign.discount_value}`}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Period:</span>
                <span className="value">
                  {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Uses:</span>
                <span className="value">
                  {campaign.current_uses} / {campaign.max_uses || '∞'}
                </span>
              </div>
            </div>

            <div className="campaign-preview" style={{ borderColor: campaign.theme_color }}>
              <div className="preview-badge" style={{ backgroundColor: campaign.theme_color }}>
                {campaign.badge_text}
              </div>
              <div className="preview-banner">
                {campaign.banner_text}
              </div>
            </div>

            <div className="campaign-actions">
              <button 
                className="btn-edit"
                onClick={() => handleEdit(campaign)}
              >
                Edit
              </button>
              {campaign.is_active ? (
                <button 
                  className="btn-deactivate"
                  onClick={() => handleDeactivate(campaign.id)}
                >
                  Deactivate
                </button>
              ) : (
                <button 
                  className="btn-activate"
                  onClick={() => handleActivate(campaign.id)}
                >
                  Activate
                </button>
              )}
              <button 
                className="btn-delete"
                onClick={() => handleDelete(campaign.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="campaign-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Campaign Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Black Friday 2025"
                  />
                </div>

                <div className="form-group">
                  <label>Campaign Type *</label>
                  <select
                    name="campaign_type"
                    value={formData.campaign_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="black_friday">🛍️ Black Friday</option>
                    <option value="cyber_monday">💻 Cyber Monday</option>
                    <option value="new_year">🎉 New Year</option>
                    <option value="summer_sale">☀️ Summer Sale</option>
                    <option value="custom">🎯 Custom</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Campaign description..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discount_type === 'percentage' ? '50' : '10.00'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Theme Color</label>
                  <input
                    type="color"
                    name="theme_color"
                    value={formData.theme_color}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Badge Text</label>
                  <input
                    type="text"
                    name="badge_text"
                    value={formData.badge_text}
                    onChange={handleInputChange}
                    placeholder="e.g., 50% OFF"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Banner Text</label>
                <input
                  type="text"
                  name="banner_text"
                  value={formData.banner_text}
                  onChange={handleInputChange}
                  placeholder="e.g., 🔥 BLACK FRIDAY SALE - 50% OFF ALL PLANS!"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="requires_coupon"
                      checked={formData.requires_coupon}
                      onChange={handleInputChange}
                    />
                    Requires Coupon Code
                  </label>
                </div>

                {formData.requires_coupon && (
                  <div className="form-group">
                    <label>Coupon Code</label>
                    <input
                      type="text"
                      name="coupon_code"
                      value={formData.coupon_code}
                      onChange={handleInputChange}
                      placeholder="e.g., BLACKFRIDAY50"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Total Uses</label>
                  <input
                    type="number"
                    name="max_uses"
                    value={formData.max_uses}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="form-group">
                  <label>Max Uses Per User</label>
                  <input
                    type="number"
                    name="max_uses_per_user"
                    value={formData.max_uses_per_user}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default DiscountCampaignManager;
