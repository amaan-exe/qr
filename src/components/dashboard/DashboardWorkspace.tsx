'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OverviewTab, { type AnalyticsData } from './OverviewTab'
import CampaignsTab, { type CampaignItem } from './CampaignsTab'
import ResponsesTab, { type ResponseItem } from './ResponsesTab'
import FeedbackTab, { type PrivateFeedbackItem } from './FeedbackTab'
import MenuTab, { type MenuItem } from './MenuTab'
import SettingsTab, { type BusinessSettings } from './SettingsTab'
import {
  LayoutDashboard,
  QrCode,
  MessageSquare,
  MessageSquareHeart,
  Utensils,
  Settings,
  Sparkles,
} from 'lucide-react'

interface DashboardWorkspaceProps {
  initialTab?: string
  business: BusinessSettings
  campaigns: CampaignItem[]
  analytics: AnalyticsData
  responses: ResponseItem[]
  feedbackList: PrivateFeedbackItem[]
  menuItems: MenuItem[]
}

type TabType = 'overview' | 'campaigns' | 'responses' | 'feedback' | 'menu' | 'settings'

const VALID_TABS: TabType[] = ['overview', 'campaigns', 'responses', 'feedback', 'menu', 'settings']

export default function DashboardWorkspace({
  initialTab,
  business,
  campaigns,
  analytics,
  responses,
  feedbackList,
  menuItems,
}: DashboardWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab && VALID_TABS.includes(initialTab as TabType) ? (initialTab as TabType) : 'overview'
  )

  useEffect(() => {
    if (initialTab && VALID_TABS.includes(initialTab as TabType)) {
      setActiveTab(initialTab as TabType)
    }
  }, [initialTab])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/dashboard?tab=${tab}`)
    }
  }

  const handleRefresh = () => {
    router.refresh()
  }

  const tabs: Array<{ key: TabType; label: string; icon: React.ElementType; badge?: number }> = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'campaigns', label: 'QR Campaigns', icon: QrCode, badge: campaigns.length },
    { key: 'responses', label: 'Responses', icon: MessageSquare, badge: responses.length },
    {
      key: 'feedback',
      label: 'Private Inbox',
      icon: MessageSquareHeart,
      badge: feedbackList.length > 0 ? feedbackList.length : undefined,
    },
    { key: 'menu', label: 'Menu Items', icon: Utensils, badge: menuItems.length },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      {/* Restaurant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {business.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {business.location ? `${business.location} • ` : ''}Restaurant Management & Analytics
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
        {activeTab === 'campaigns' && (
          <CampaignsTab campaigns={campaigns} onRefresh={handleRefresh} />
        )}
        {activeTab === 'responses' && <ResponsesTab responses={responses} />}
        {activeTab === 'feedback' && <FeedbackTab feedbackList={feedbackList} />}
        {activeTab === 'menu' && <MenuTab menuItems={menuItems} onRefresh={handleRefresh} />}
        {activeTab === 'settings' && (
          <SettingsTab business={business} onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  )
}
