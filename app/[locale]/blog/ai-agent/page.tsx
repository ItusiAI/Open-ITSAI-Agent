import { AiAgentContent } from '@/components/ai-agent/ai-agent-content'
import { PageSEO } from '@/components/seo/page-seo'

export default function AiAgentBlogPage() {
  return (
    <>
      <PageSEO
        page="ai-agent"
        structuredDataTypes={['website']}
      />
      <AiAgentContent />
    </>
  )
}