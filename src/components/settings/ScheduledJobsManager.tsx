'use client';

import { useState, useEffect } from 'react';

interface Job {
  name: string;
  schedule: string;
  description: string;
  enabled: boolean;
  running: boolean;
}

export default function ScheduledJobsManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const runJob = async (jobName: string) => {
    if (!confirm(`Chạy job "${jobName}" ngay bây giờ?`)) {
      return;
    }

    setRunningJob(jobName);
    try {
      const response = await fetch(`/api/jobs/${jobName}/run`, {
        method: 'POST',
      });

      if (response.ok) {
        alert(`✅ Job "${jobName}" đã chạy thành công!`);
      } else {
        const error = await response.json();
        alert(`❌ Lỗi: ${error.message || 'Failed to run job'}`);
      }
    } catch (error) {
      console.error('Failed to run job:', error);
      alert('❌ Không thể chạy job');
    } finally {
      setRunningJob(null);
    }
  };

  const getJobCategoryIcon = (name: string): string => {
    if (name.includes('WEBHOOK')) return '🪝';
    if (name.includes('EMAIL') || name.includes('SUMMARIES')) return '📧';
    if (name.includes('CLEANUP') || name.includes('DATABASE')) return '🗑️';
    if (name.includes('OPTIMIZE')) return '⚡';
    if (name.includes('STATS')) return '📊';
    if (name.includes('MONITOR')) return '👀';
    return '⏰';
  };

  const getJobCategory = (name: string): string => {
    if (name.includes('WEBHOOK')) return 'Webhooks';
    if (name.includes('EMAIL') || name.includes('SUMMARIES')) return 'Emails';
    if (name.includes('CLEANUP')) return 'Cleanup';
    if (name.includes('DATABASE')) return 'Database';
    return 'Other';
  };

  const formatSchedule = (schedule: string): string => {
    // Convert cron to human-readable
    const scheduleMap: Record<string, string> = {
      '*/5 * * * *': 'Mỗi 5 phút',
      '*/15 * * * *': 'Mỗi 15 phút',
      '0 * * * *': 'Mỗi giờ',
      '0 */6 * * *': 'Mỗi 6 giờ',
      '0 2 * * *': 'Hàng ngày lúc 2:00 AM',
      '0 6 * * *': 'Hàng ngày lúc 6:00 AM',
      '0 9 * * *': 'Hàng ngày lúc 9:00 AM',
      '0 3 * * 0': 'Chủ nhật lúc 3:00 AM',
      '0 9 * * 1': 'Thứ 2 lúc 9:00 AM',
      '0 0 1 * *': 'Ngày 1 hàng tháng',
    };
    return scheduleMap[schedule] || schedule;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group jobs by category
  const categories = Array.from(new Set(jobs.map(j => getJobCategory(j.name))));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white">⏰ Scheduled Jobs</h3>
        <p className="text-sm text-slate-400">
          Các tác vụ tự động chạy theo lịch định kỳ
        </p>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-sky-500/20 rounded-lg p-4 border border-sky-500/30">
          <div className="text-2xl font-bold text-sky-300">
            {jobs.length}
          </div>
          <div className="text-sm text-slate-400">Tổng Jobs</div>
        </div>
        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-2xl font-bold text-green-300">
            {jobs.filter(j => j.enabled).length}
          </div>
          <div className="text-sm text-slate-400">Đang bật</div>
        </div>
        <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-300">
            {jobs.filter(j => j.running).length}
          </div>
          <div className="text-sm text-slate-400">Đang chạy</div>
        </div>
        <div className="bg-slate-500/20 rounded-lg p-4 border border-slate-500/30">
          <div className="text-2xl font-bold text-slate-300">
            {jobs.filter(j => !j.enabled).length}
          </div>
          <div className="text-sm text-slate-400">Bị tắt</div>
        </div>
      </div>

      {/* Jobs by Category */}
      {categories.map(category => {
        const categoryJobs = jobs.filter(j => getJobCategory(j.name) === category);
        
        return (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-slate-200 flex items-center space-x-2">
              <span>{getJobCategoryIcon(categoryJobs[0]?.name || '')}</span>
              <span>{category} Jobs</span>
              <span className="text-sm text-slate-400">({categoryJobs.length})</span>
            </h4>

            <div className="space-y-2">
              {categoryJobs.map((job) => (
                <div
                  key={job.name}
                  className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-sm font-medium text-white">
                          {job.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            job.enabled
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-slate-500/20 text-slate-300'
                          }`}
                        >
                          {job.enabled ? '✓ Enabled' : '✗ Disabled'}
                        </span>
                        {job.running && (
                          <span className="px-2 py-0.5 text-xs rounded bg-sky-500/20 text-sky-300 animate-pulse">
                            ⚡ Running
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-1">
                        {job.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>
                          📅 {formatSchedule(job.schedule)}
                        </span>
                        <span className="font-mono text-slate-600">
                          {job.schedule}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => runJob(job.name)}
                        disabled={!job.enabled || runningJob === job.name}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          !job.enabled
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            : runningJob === job.name
                            ? 'bg-sky-500/20 text-sky-300 cursor-wait'
                            : 'bg-sky-500 text-white hover:bg-sky-600'
                        }`}
                      >
                        {runningJob === job.name ? (
                          <span className="flex items-center space-x-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Running...</span>
                          </span>
                        ) : (
                          '▶ Chạy ngay'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Info Box */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4">
        <h5 className="font-medium text-sky-200 mb-2">ℹ️ Thông tin</h5>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Jobs tự động chạy theo lịch đã định</li>
          <li>• Bạn có thể chạy thủ công bất kỳ job nào bằng nút &quot;Chạy ngay&quot;</li>
          <li>• Jobs bị tắt sẽ không chạy tự động</li>
          <li>• Trong development, tất cả jobs mặc định bị tắt</li>
          <li>• Xem logs trong terminal/console để debug</li>
        </ul>
      </div>

      {/* Environment Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h5 className="font-medium text-white mb-2">🔧 Cấu hình</h5>
        <div className="text-sm text-slate-300 space-y-1 font-mono">
          <div>
            <span className="text-slate-400">NODE_ENV:</span>{' '}
            <span className="font-semibold text-white">{process.env.NODE_ENV || 'development'}</span>
          </div>
          <div>
            <span className="text-slate-400">Timezone:</span>{' '}
            <span className="font-semibold text-white">{process.env.TZ || 'Asia/Ho_Chi_Minh'}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Để enable/disable jobs trong development, thêm ENABLE_JOB_[NAME]=true vào .env
        </p>
      </div>
    </div>
  );
}
