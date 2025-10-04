import { Metadata } from 'next'
import NotificationSettings from '@/components/settings/NotificationSettings'
import ApiKeyManager from '@/components/settings/ApiKeyManager'
import WebhookManager from '@/components/settings/WebhookManager'
import ScheduledJobsManager from '@/components/settings/ScheduledJobsManager'

export const metadata: Metadata = {
  title: 'Cài đặt - Addressify',
  description: 'Quản lý cài đặt tài khoản và thông báo',
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚙️ Cài đặt</h1>
          <p className="text-white/60">Quản lý tài khoản và thông báo của bạn</p>
        </div>

        <div className="space-y-6">
          <NotificationSettings />

          {/* API Keys Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <ApiKeyManager />
          </div>

          {/* Webhooks Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <WebhookManager />
          </div>

          {/* Scheduled Jobs Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <ScheduledJobsManager />
          </div>
        </div>
      </div>
    </div>
  )
}
