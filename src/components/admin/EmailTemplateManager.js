import React, { useState, useEffect, useCallback } from 'react';
import {
  FaEnvelope, FaEdit, FaEye, FaPaperPlane, FaToggleOn, FaToggleOff,
  FaCode, FaInfoCircle, FaTimes, FaCheck, FaSpinner, FaSearch
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState({ subject: '', body_html: '', body_text: '' });

  const showMsg = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getEmailTemplates();
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
      showMsg('error', 'Failed to load email templates');
    } finally {
      setLoading(false);
    }
  }, [showMsg]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const loadTemplate = async (slug) => {
    try {
      const res = await apiService.getEmailTemplate(slug);
      const t = res.data.template;
      setSelectedTemplate(t);
      setEditForm({ subject: t.subject, body_html: t.body_html, body_text: t.body_text || '' });
      setEditing(false);
      setPreviewing(false);
    } catch (err) {
      showMsg('error', 'Failed to load template');
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    try {
      setSaving(true);
      await apiService.updateEmailTemplate(selectedTemplate.slug, editForm);
      showMsg('success', 'Template saved successfully');
      setEditing(false);
      await loadTemplates();
      // Reload the selected template
      await loadTemplate(selectedTemplate.slug);
    } catch (err) {
      showMsg('error', 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (slug) => {
    try {
      await apiService.toggleEmailTemplate(slug);
      await loadTemplates();
      if (selectedTemplate?.slug === slug) {
        await loadTemplate(slug);
      }
      showMsg('success', 'Template toggled');
    } catch (err) {
      showMsg('error', 'Failed to toggle template');
    }
  };

  const handleTest = async () => {
    if (!selectedTemplate || !testEmail) return;
    try {
      setTesting(true);
      await apiService.testEmailTemplate(selectedTemplate.slug, testEmail);
      showMsg('success', `Test email sent to ${testEmail}`);
      setTestEmail('');
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const categoryColors = {
    auth: 'bg-blue-600',
    billing: 'bg-green-600',
    lifecycle: 'bg-yellow-600',
    support: 'bg-purple-600',
    security: 'bg-red-600',
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group templates by category
  const grouped = filteredTemplates.reduce((acc, t) => {
    const cat = t.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <FaSpinner className="animate-spin mr-2" /> Loading email templates...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Email Templates</h2>
          <p className="text-gray-400 mt-1">Manage all outgoing email templates. Use {'{{variables}}'} for dynamic content.</p>
        </div>
        {message.text && (
          <div className={`px-4 py-2 rounded-lg text-white text-sm ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List (Left Column) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Template Cards */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2 px-1">
                  {category}
                </h4>
                {items.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => loadTemplate(t.slug)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition border ${
                      selectedTemplate?.slug === t.slug
                        ? 'bg-blue-600 bg-opacity-30 border-blue-500'
                        : 'bg-white bg-opacity-5 border-transparent hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm">{t.name}</span>
                      <span className={`w-2 h-2 rounded-full ${t.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <p className="text-gray-400 text-xs mt-1 truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${categoryColors[t.category] || 'bg-gray-600'}`}>
                        {t.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Template Detail (Right Column) */}
        <div className="lg:col-span-2">
          {!selectedTemplate ? (
            <Card className="p-12 text-center">
              <FaEnvelope className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Select a template to view or edit</p>
            </Card>
          ) : (
            <Card className="p-6 space-y-6">
              {/* Template Header */}
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedTemplate.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{selectedTemplate.description}</p>
                  <span className="text-xs text-gray-500 font-mono">slug: {selectedTemplate.slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(selectedTemplate.slug)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                      selectedTemplate.is_active
                        ? 'bg-green-600 bg-opacity-30 text-green-300 hover:bg-opacity-50'
                        : 'bg-red-600 bg-opacity-30 text-red-300 hover:bg-opacity-50'
                    }`}
                  >
                    {selectedTemplate.is_active ? <FaToggleOn /> : <FaToggleOff />}
                    {selectedTemplate.is_active ? 'Active' : 'Disabled'}
                  </button>
                  {!editing ? (
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      <FaEdit className="mr-1" /> Edit
                    </Button>
                  ) : (
                    <>
                      <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? <FaSpinner className="animate-spin mr-1" /> : <FaCheck className="mr-1" />}
                        Save
                      </Button>
                      <Button variant="secondary" onClick={() => {
                        setEditing(false);
                        setEditForm({ subject: selectedTemplate.subject, body_html: selectedTemplate.body_html, body_text: selectedTemplate.body_text || '' });
                      }}>
                        <FaTimes className="mr-1" /> Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Available Variables */}
              <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-300 font-medium mb-2">
                  <FaCode /> Available Variables
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedTemplate.available_variables || []).map((v) => (
                    <span
                      key={v}
                      className="text-xs font-mono bg-blue-800 bg-opacity-50 text-blue-200 px-2 py-1 rounded cursor-pointer hover:bg-opacity-80 transition"
                      onClick={() => {
                        if (editing) {
                          navigator.clipboard.writeText(`{{${v}}}`);
                          showMsg('success', `Copied {{${v}}} to clipboard`);
                        }
                      }}
                      title={editing ? `Click to copy {{${v}}}` : v}
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  <FaInfoCircle className="inline mr-1" />
                  Global: {'{{app_name}}, {{year}}, {{support_email}}, {{frontend_url}}'} are always available.
                  {editing && ' Click a variable to copy it.'}
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Subject Line</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-white bg-opacity-5 text-gray-200 font-mono text-sm">
                    {selectedTemplate.subject}
                  </div>
                )}
              </div>

              {/* HTML Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 font-medium">HTML Body</label>
                  {!editing && (
                    <button
                      onClick={() => setPreviewing(!previewing)}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <FaEye /> {previewing ? 'Show Source' : 'Preview'}
                    </button>
                  )}
                </div>
                {editing ? (
                  <textarea
                    value={editForm.body_html}
                    onChange={(e) => setEditForm(f => ({ ...f, body_html: e.target.value }))}
                    rows={16}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-white border-opacity-20 text-green-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    spellCheck={false}
                  />
                ) : previewing ? (
                  <div
                    className="bg-white rounded-lg p-4 max-h-96 overflow-auto"
                  >
                    <iframe
                      title="Email Preview"
                      sandbox=""
                      srcDoc={selectedTemplate.body_html}
                      style={{ width: '100%', minHeight: '300px', border: 'none' }}
                    />
                  </div>
                ) : (
                  <pre className="bg-gray-900 rounded-lg p-4 text-green-300 text-xs font-mono max-h-96 overflow-auto whitespace-pre-wrap">
                    {selectedTemplate.body_html}
                  </pre>
                )}
              </div>

              {/* Plain-text Body */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Plain Text Body (fallback)</label>
                {editing ? (
                  <textarea
                    value={editForm.body_text}
                    onChange={(e) => setEditForm(f => ({ ...f, body_text: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-white border-opacity-20 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                ) : (
                  <pre className="bg-gray-900 rounded-lg p-4 text-gray-300 text-xs font-mono max-h-48 overflow-auto whitespace-pre-wrap">
                    {selectedTemplate.body_text || '(not set — HTML only)'}
                  </pre>
                )}
              </div>

              {/* Send Test Email */}
              <div className="border-t border-white border-opacity-10 pt-4">
                <label className="block text-gray-300 mb-2 font-medium">
                  <FaPaperPlane className="inline mr-1" /> Send Test Email
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    variant="primary"
                    onClick={handleTest}
                    disabled={testing || !testEmail}
                  >
                    {testing ? <FaSpinner className="animate-spin" /> : 'Send Test'}
                  </Button>
                </div>
                <p className="text-gray-500 text-xs mt-1">Sends this template with sample data to the specified email.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;
