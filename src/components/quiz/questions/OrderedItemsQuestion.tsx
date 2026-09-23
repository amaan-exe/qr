'use client'

import { UtensilsCrossed, Check, Plus } from 'lucide-react'

export interface MenuItemData {
  id: string
  name: any
}

interface OrderedItemsQuestionProps {
  menuItems: MenuItemData[]
  value: string[]
  onChange: (value: string[]) => void
}

export default function OrderedItemsQuestion({
  menuItems,
  value,
  onChange,
}: OrderedItemsQuestionProps) {
  const toggleItem = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((i) => i !== id))
    } else {
      onChange([...value, id])
    }
  }

  const getItemName = (item: MenuItemData): string => {
    if (typeof item.name === 'string') return item.name
    if (typeof item.name === 'object' && item.name !== null) {
      return item.name.en || Object.values(item.name)[0] || 'Menu item'
    }
    return 'Menu item'
  }

  return (
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Optional • 5 of 5
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          What did you order today?
        </h2>
        <p className="text-sm text-slate-400">
          Select dishes or beverages you enjoyed
        </p>
      </div>

      {/* Grid of Menu Items */}
      <div
        role="group"
        aria-label="Ordered dishes"
        className="py-2 flex flex-wrap justify-center gap-2.5 max-w-lg mx-auto"
      >
        {menuItems.map((item) => {
          const isSelected = value.includes(item.id)
          const name = getItemName(item)

          return (
            <button
              key={item.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleItem(item.id)}
              aria-label={name}
              className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                isSelected
                  ? 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              {isSelected ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{name}</span>
            </button>
          )
        })}

        {/* 'Other' Chip Option */}
        <button
          type="button"
          role="checkbox"
          aria-checked={value.includes('other')}
          onClick={() => toggleItem('other')}
          aria-label="Other dishes"
          className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            value.includes('other')
              ? 'border-amber-500 bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/25'
              : 'border-dashed border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          {value.includes('other') ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>Other dishes</span>
        </button>
      </div>

      <p className="text-xs text-slate-400">
        {value.length === 0 ? 'Select any dishes or tap Finish' : `${value.length} item(s) selected`}
      </p>
    </div>
  )
}
