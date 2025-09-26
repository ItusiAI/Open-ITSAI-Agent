import { AiAgentTypesContent } from '@/components/ai-agent-types/ai-agent-types-content'
import { PageSEO } from '@/components/seo/page-seo'

export default function AiAgentTypesPage() {
  return (
    <>
      <PageSEO
        page="ai-agent-types"
        structuredDataTypes={['website', 'organization']}
      />
      <AiAgentTypesContent />
    </>
  )
}