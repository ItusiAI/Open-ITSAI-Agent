import { useTranslations } from 'next-intl'

interface DiscountPriceDisplayProps {
  originalPrice: string
  discountedPrice: string
  discountPercent: string
  savings: string
  discountBadge: string
}

export function DiscountPriceDisplay({
  originalPrice,
  discountedPrice,
  discountPercent,
  savings,
  discountBadge
}: DiscountPriceDisplayProps) {
  const t = useTranslations('pricing.discount')

  return (
    <div className="space-y-3">
      {/* 折扣标签 */}
      <div className="flex justify-center">
        <div className="relative inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 animate-pulse opacity-75"></div>
          <span className="relative mr-1 animate-bounce">🔥</span>
          <span className="relative">{discountBadge}</span>
        </div>
      </div>
      
      {/* 价格对比 */}
      <div className="flex items-baseline justify-center gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('was')}
          </div>
          <span className="text-xl text-gray-400 dark:text-gray-500 line-through font-medium">
            {originalPrice}
          </span>
        </div>

        <div className="text-center">
          <div className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">
            {t('now')}
          </div>
          <span className="text-4xl font-bold text-red-600 dark:text-red-400 relative">
            {discountedPrice}
            <div className="absolute -inset-1 bg-red-100 dark:bg-red-900/30 rounded-lg opacity-20 animate-ping"></div>
          </span>
        </div>
      </div>
      
      {/* 节省信息 */}
      <div className="flex justify-center">
        <div className="inline-flex items-center px-3 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
          <span className="text-sm text-green-700 dark:text-green-300 font-semibold mr-2">
            💰 {t('save')} {savings}
          </span>
          <span className="text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 px-2 py-1 rounded-full font-medium">
            -{discountPercent}% {t('off')}
          </span>
        </div>
      </div>
    </div>
  )
}

export function RegularPriceDisplay({ price }: { price: string }) {
  return (
    <div className="text-4xl font-bold text-primary">
      {price}
    </div>
  )
}
