'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OverviewTab from './OverviewTab'
import CampaignsTab, { type CampaignItem } from './CampaignsTab'
import ResponsesTab from './ResponsesTab'
import FeedbackTab from './FeedbackTab'
import MenuTab from './MenuTab'
import SettingsTab from './SettingsTab'
import CustomersPortalTab, { type CustomerDetail } from './CustomersPortalTab'
import {
  LayoutDashboard,
  QrCode,
  MessageSquare,
  MessageSquareHeart,
  Utensils,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'

interface DashboardWorkspaceProps {
  initialTab?: string
  business: any
  analytics: any
  campaigns: CampaignItem[]
  responses: any[]
  feedbackList: any[]
  menuItems: any[]
  customers?: CustomerDetail[]
}

type TabType = 'overview' | 'customers' | 'responses' | 'campaigns' | 'feedback' | 'menu' | 'settings'

const VALID_TABS: TabType[] = ['overview', 'customers', 'responses', 'campaigns', 'feedback', 'menu', 'settings']

export default function DashboardWorkspace({
  initialTab: propInitialTab,
  business,
  analytics,
  campaigns,
  responses,
  feedbackList,
  menuItems,
  customers = [],
}: DashboardWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryTab = searchParams.get('tab')
  const initialTab = propInitialTab || queryTab

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

  const phoneCount = customers.filter((c) => c.hasPhone).length

  const tabs: Array<{ key: TabType; label: string; icon: React.ElementType; badge?: number }> = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'customers', label: 'Customers', icon: Users, badge: phoneCount },
    { key: 'responses', label: 'Responses', icon: MessageSquare, badge: responses.length },
    { key: 'campaigns', label: 'QR Campaigns', icon: QrCode, badge: campaigns.length },
    {
      key: 'feedback',
      label: 'Inbox',
      icon: MessageSquareHeart,
      badge: feedbackList.length > 0 ? feedbackList.length : undefined,
    },
    { key: 'menu', label: 'Menu', icon: Utensils, badge: menuItems.length },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Restaurant Header */}
      <div className="space-y-3 pb-3 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                {business.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Live
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xl">
              {business.location ? `${business.location} • ` : ''}Restaurant Management &amp; Analytics
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons - Touch-friendly Mobile Horizontal Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-95 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white shadow-md shadow-amber-600/25 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 leading-none ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-300'
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
      <div className="min-w-0">
        {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
        {activeTab === 'customers' && (
          <CustomersPortalTab customers={customers} restaurantName={business.name} />
        )}
        {activeTab === 'responses' && <ResponsesTab responses={responses} />}
        {activeTab === 'campaigns' && (
          <CampaignsTab campaigns={campaigns} onRefresh={handleRefresh} />
        )}
        {activeTab === 'feedback' && <FeedbackTab feedbackList={feedbackList} />}
        {activeTab === 'menu' && (
          <MenuTab menuItems={menuItems} onRefresh={handleRefresh} />
        )}
        {activeTab === 'settings' && <SettingsTab business={business} onRefresh={handleRefresh} />}
      </div>
    </div>
  )
}
