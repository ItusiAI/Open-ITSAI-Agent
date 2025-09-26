"use client"

import { AgentContent } from '@/components/agent/agent-content'
import { PageSEO } from '@/components/seo/page-seo'

export default function AgentPage() {
  return (
    <>
      {/* SEO组件 - 不显示面包屑 */}
      <PageSEO
        page="agent"
        structuredDataTypes={['website', 'organization', 'service']}
      />

      <AgentContent />
    </>
  )
}
