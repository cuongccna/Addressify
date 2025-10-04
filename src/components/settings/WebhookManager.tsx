'use client';

import { useState, useEffect } from 'react';
import { 
  EVENT_DESCRIPTIONS, 
  EVENT_CATEGORIES,
  WebhookEventType 
} from '@/lib/webhooks/events';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
}

interface WebhookLog {
  id: string;
  event: string;
  statusCode: number | null;
  attempt: number;
  success: boolean;
  error: string | null;
  timestamp: string;
}

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Form state
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (webhookId: string) => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCreate = async () => {
    if (!url || selectedEvents.length === 0) {
      alert('Vui lòng nhập URL và chọn ít nhất 1 event');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks([...webhooks, data.webhook]);
        setShowSecret(data.webhook.id);
        setShowCreateForm(false);
        setUrl('');
        setSelectedEvents([]);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create webhook');
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
      alert('Failed to create webhook');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/toggle`, {
        method: 'POST',
      });

      if (response.ok) {
        setWebhooks(
          webhooks.map(w =>
            w.id === webhookId ? { ...w, isActive: !w.isActive } : w
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Bạn có chắc muốn xóa webhook này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId));
        if (selectedWebhook === webhookId) {
          setSelectedWebhook(null);
          setLogs([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const handleTest = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Test webhook sent! Check your endpoint logs.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send test webhook');
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
      alert('Failed to send test webhook');
    }
  };

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter(e => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const selectAllInCategory = (category: string[]) => {
    const allSelected = category.every(e => selectedEvents.includes(e));
    if (allSelected) {
      setSelectedEvents(selectedEvents.filter(e => !category.includes(e)));
    } else {
      const combined = [...selectedEvents, ...category];
      const unique = combined.filter((v, i, a) => a.indexOf(v) === i);
      setSelectedEvents(unique);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">🪝 Webhook Management</h3>
          <p className="text-sm text-gray-600">
            Nhận thông báo real-time về các events trong hệ thống
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Tạo Webhook
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h4 className="font-semibold">Tạo Webhook Mới</h4>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Webhook URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-domain.com/webhook"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL sẽ nhận POST requests với event data
            </p>
          </div>

          {/* Events Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Events * ({selectedEvents.length} selected)
            </label>

            {/* Quote Events */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  📊 Quote Events
                </span>
                <button
                  onClick={() => selectAllInCategory(EVENT_CATEGORIES.quotes)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {EVENT_CATEGORIES.quotes.every(e => selectedEvents.includes(e))
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              </div>
              <div className="space-y-2 pl-4">
                {EVENT_CATEGORIES.quotes.map((event) => (
                  <label key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {EVENT_DESCRIPTIONS[event as WebhookEventType]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shop Events */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  🏪 Shop Events
                </span>
                <button
                  onClick={() => selectAllInCategory(EVENT_CATEGORIES.shops)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {EVENT_CATEGORIES.shops.every(e => selectedEvents.includes(e))
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              </div>
              <div className="space-y-2 pl-4">
                {EVENT_CATEGORIES.shops.map((event) => (
                  <label key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {EVENT_DESCRIPTIONS[event as WebhookEventType]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Address Events */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  📍 Address Events
                </span>
                <button
                  onClick={() => selectAllInCategory(EVENT_CATEGORIES.addresses)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {EVENT_CATEGORIES.addresses.every(e => selectedEvents.includes(e))
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              </div>
              <div className="space-y-2 pl-4">
                {EVENT_CATEGORIES.addresses.map((event) => (
                  <label key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {EVENT_DESCRIPTIONS[event as WebhookEventType]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Analytics Events */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  📈 Analytics Events
                </span>
                <button
                  onClick={() => selectAllInCategory(EVENT_CATEGORIES.analytics)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {EVENT_CATEGORIES.analytics.every(e => selectedEvents.includes(e))
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              </div>
              <div className="space-y-2 pl-4">
                {EVENT_CATEGORIES.analytics.map((event) => (
                  <label key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {EVENT_DESCRIPTIONS[event as WebhookEventType]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setUrl('');
                setSelectedEvents([]);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={creating}
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !url || selectedEvents.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Đang tạo...' : '✨ Tạo Webhook'}
            </button>
          </div>
        </div>
      )}

      {/* Show Secret */}
      {showSecret && webhooks.find(w => w.id === showSecret) && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Lưu Webhook Secret
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                Đây là lần duy nhất bạn có thể xem secret. Lưu lại ngay!
              </p>
              <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                {webhooks.find(w => w.id === showSecret)?.secret}
              </div>
              <button
                onClick={() => {
                  const secret = webhooks.find(w => w.id === showSecret)?.secret;
                  if (secret) {
                    navigator.clipboard.writeText(secret);
                    alert('Đã copy secret!');
                  }
                }}
                className="mt-3 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                📋 Copy Secret
              </button>
              <button
                onClick={() => setShowSecret(null)}
                className="mt-3 ml-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Đã lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">Chưa có webhook nào</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Tạo webhook đầu tiên
            </button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white border rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-sm font-medium">
                      {webhook.url}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        webhook.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {webhook.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {webhook.events.length} events • Created{' '}
                    {new Date(webhook.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTest(webhook.id)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    title="Send test webhook"
                  >
                    🧪 Test
                  </button>
                  <button
                    onClick={() => handleToggle(webhook.id)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    {webhook.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedWebhook === webhook.id) {
                        setSelectedWebhook(null);
                        setLogs([]);
                      } else {
                        setSelectedWebhook(webhook.id);
                        loadLogs(webhook.id);
                      }
                    }}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    📋 Logs
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Events */}
              <div className="flex flex-wrap gap-1">
                {webhook.events.map((event) => (
                  <span
                    key={event}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {event}
                  </span>
                ))}
              </div>

              {/* Logs */}
              {selectedWebhook === webhook.id && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-3">Recent Deliveries</h5>
                  {loadingLogs ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No deliveries yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`text-lg ${
                                log.success ? '✅' : '❌'
                              }`}
                            >
                              {log.success ? '✅' : '❌'}
                            </span>
                            <div>
                              <div className="font-medium">{log.event}</div>
                              <div className="text-xs text-gray-600">
                                {new Date(log.timestamp).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {log.statusCode && (
                              <div className="font-mono text-xs">
                                {log.statusCode}
                              </div>
                            )}
                            <div className="text-xs text-gray-600">
                              Attempt {log.attempt}
                            </div>
                            {log.error && (
                              <div className="text-xs text-red-600 max-w-xs truncate">
                                {log.error}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
