import { AudioSummaryHowItWorksContent } from '@/components/audio-summary-how-it-works/audio-summary-how-it-works-content'
import { PageSEO } from '@/components/seo/page-seo'

export default function AudioSummaryHowItWorksPage() {
  return (
    <>
      <PageSEO
        page="audio-summary-how-it-works"
        structuredDataTypes={['website']}
      />
      <AudioSummaryHowItWorksContent />
    </>
  )
}
