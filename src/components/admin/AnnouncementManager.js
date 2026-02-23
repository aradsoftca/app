import React, { useState, useEffect, useCallback } from 'react';
import {
  FaBullhorn, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
  FaSpinner, FaInfoCircle, FaExclamationTriangle, FaCheckCircle,
  FaTimes, FaCheck, FaClock, FaMobileAlt, FaGlobe
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view, 'new' = creating, id = editing
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const emptyForm = {
    title: '',
    content: '',
    type: 'info',
    target_audience: 'all',
    is_active: true,
    show_in_app: true,
    show_on_website: false,
    priority: 0,
    starts_at: '',
    ends_at: '',
  };
  const [form, setForm] = useState(emptyForm);
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  const showMsg = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getAnnouncements();
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      showMsg('error', 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [showMsg]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const handleCreate = () => {
    setForm(emptyForm);
    setEditing('new');
  };

  const handleEdit = (ann) => {
    setForm({
      title: ann.title,
      content: ann.content,
      type: ann.type || 'info',
      target_audience: ann.target_audience || 'all',
      is_active: ann.is_active,
      show_in_app: ann.show_in_app !== false,
      show_on_website: ann.show_on_website || false,
      priority: ann.priority || 0,
      starts_at: ann.starts_at ? ann.starts_at.slice(0, 16) : '',
      ends_at: ann.ends_at ? ann.ends_at.slice(0, 16) : '',
    });
    setEditing(ann.id);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showMsg('error', 'Title and content are required');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      };
      if (editing === 'new') {
        await apiService.createAnnouncement(payload);
        showMsg('success', 'Announcement created');
      } else {
        await apiService.updateAnnouncement(editing, payload);
        showMsg('success', 'Announcement updated');
      }
      setEditing(null);
      await loadAnnouncements();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({ title: 'Delete Announcement', message: 'Delete this announcement?', confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await apiService.deleteAnnouncement(id);
      showMsg('success', 'Announcement deleted');
      await loadAnnouncements();
    } catch (err) {
      showMsg('error', 'Failed to delete announcement');
    }
  };

  const handleToggle = async (id) => {
    try {
      await apiService.toggleAnnouncement(id);
      await loadAnnouncements();
      showMsg('success', 'Announcement toggled');
    } catch (err) {
      showMsg('error', 'Failed to toggle announcement');
    }
  };

  const typeConfig = {
    info: { icon: FaInfoCircle, color: 'blue', label: 'Info' },
    warning: { icon: FaExclamationTriangle, color: 'yellow', label: 'Warning' },
    success: { icon: FaCheckCircle, color: 'green', label: 'Success' },
    error: { icon: FaExclamationTriangle, color: 'red', label: 'Error/Urgent' },
    maintenance: { icon: FaClock, color: 'orange', label: 'Maintenance' },
  };

  const inputClass = "w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <FaSpinner className="animate-spin mr-2" /> Loading announcements...
      </div>
    );
  }

  // ========== EDIT / CREATE FORM ==========
  if (editing !== null) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">
            {editing === 'new' ? 'Create Announcement' : 'Edit Announcement'}
          </h2>
          <Button variant="secondary" onClick={() => setEditing(null)}>
            <FaTimes className="mr-1" /> Cancel
          </Button>
        </div>

        <Card className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Announcement title..."
              className={inputClass}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4}
              placeholder="Announcement message..."
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Type + Audience + Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className={inputClass}
              >
                {Object.entries(typeConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Target Audience</label>
              <select
                value={form.target_audience}
                onChange={(e) => setForm(f => ({ ...f, target_audience: e.target.value }))}
                className={inputClass}
              >
                <option value="all">All Users</option>
                <option value="free">Free Users</option>
                <option value="premium">Premium Users</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Priority</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
                className={inputClass}
                min="0"
                max="100"
              />
              <p className="text-gray-500 text-xs mt-1">Higher = shown first</p>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'is_active', label: 'Active', desc: 'Announcement is live' },
              { key: 'show_in_app', label: 'Show in App', desc: 'Visible in mobile app', icon: FaMobileAlt },
              { key: 'show_on_website', label: 'Show on Website', desc: 'Visible on website', icon: FaGlobe },
            ].map(({ key, label, desc, icon: Icon }) => (
              <div key={key} className="bg-white bg-opacity-5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="text-gray-400" />}
                    <span className="text-white font-medium">{label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-gray-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                <FaClock className="inline mr-1" /> Start Date (optional)
              </label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm(f => ({ ...f, starts_at: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                <FaClock className="inline mr-1" /> End Date (optional)
              </label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm(f => ({ ...f, ends_at: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-gray-500 text-xs">Leave dates empty for the announcement to show immediately with no expiration.</p>

          {/* Preview */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Preview</label>
            <AnnouncementPreview title={form.title} content={form.content} type={form.type} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white border-opacity-10">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? <FaSpinner className="animate-spin mr-1" /> : <FaCheck className="mr-1" />}
              {editing === 'new' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========== LIST VIEW ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Announcements</h2>
          <p className="text-gray-400 mt-1">Manage in-app and website announcements shown to users.</p>
        </div>
        <div className="flex items-center gap-3">
          {message.text && (
            <div className={`px-4 py-2 rounded-lg text-white text-sm ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {message.text}
            </div>
          )}
          <Button variant="primary" onClick={handleCreate}>
            <FaPlus className="mr-1" /> New Announcement
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {announcements.length === 0 ? (
        <Card className="p-12 text-center">
          <FaBullhorn className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">No announcements yet</p>
          <Button variant="primary" onClick={handleCreate}>
            <FaPlus className="mr-1" /> Create First Announcement
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const tc = typeConfig[ann.type] || typeConfig.info;
            const TypeIcon = tc.icon;
            const isExpired = ann.ends_at && new Date(ann.ends_at) < new Date();
            const isScheduled = ann.starts_at && new Date(ann.starts_at) > new Date();

            return (
              <Card key={ann.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-${tc.color}-600 bg-opacity-20 mt-1`}>
                      <TypeIcon className={`text-${tc.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-bold text-lg">{ann.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full text-white bg-${tc.color}-600`}>
                          {tc.label}
                        </span>
                        {ann.is_active && !isExpired && !isScheduled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-white">LIVE</span>
                        )}
                        {isScheduled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-600 text-white">SCHEDULED</span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-600 text-white">EXPIRED</span>
                        )}
                        {!ann.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white">DISABLED</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mt-1 line-clamp-2">{ann.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {ann.show_in_app && <span className="flex items-center gap-1"><FaMobileAlt /> App</span>}
                        {ann.show_on_website && <span className="flex items-center gap-1"><FaGlobe /> Website</span>}
                        <span>{ann.target_audience || 'all'} users</span>
                        {ann.starts_at && <span>From: {new Date(ann.starts_at).toLocaleDateString()}</span>}
                        {ann.ends_at && <span>Until: {new Date(ann.ends_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(ann.id)}
                      className={`p-2 rounded-lg transition ${
                        ann.is_active
                          ? 'text-green-400 hover:bg-green-600 hover:bg-opacity-20'
                          : 'text-gray-500 hover:bg-gray-600 hover:bg-opacity-20'
                      }`}
                      title={ann.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {ann.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                    </button>
                    <button
                      onClick={() => handleEdit(ann)}
                      className="p-2 rounded-lg text-blue-400 hover:bg-blue-600 hover:bg-opacity-20 transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-600 hover:bg-opacity-20 transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

// ========== Announcement Preview Component ==========
const AnnouncementPreview = ({ title, content, type }) => {
  const colors = {
    info: { bg: 'bg-blue-600 bg-opacity-20', border: 'border-blue-500', text: 'text-blue-200' },
    warning: { bg: 'bg-yellow-600 bg-opacity-20', border: 'border-yellow-500', text: 'text-yellow-200' },
    success: { bg: 'bg-green-600 bg-opacity-20', border: 'border-green-500', text: 'text-green-200' },
    error: { bg: 'bg-red-600 bg-opacity-20', border: 'border-red-500', text: 'text-red-200' },
    maintenance: { bg: 'bg-orange-600 bg-opacity-20', border: 'border-orange-500', text: 'text-orange-200' },
  };
  const c = colors[type] || colors.info;

  return (
    <div className={`${c.bg} border ${c.border} rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <h5 className={`${c.text} font-bold`}>{title || 'Announcement Title'}</h5>
          <p className={`${c.text} text-sm mt-1 opacity-80`}>{content || 'Announcement content will appear here...'}</p>
        </div>
        <button className={`${c.text} opacity-50 hover:opacity-100`}><FaTimes /></button>
      </div>
    </div>
  );
};

export default AnnouncementManager;
