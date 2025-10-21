import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ebookStore, ebookSelectors } from '../store/ebookStore'
import { EbookEditor } from '../components/EbookEditor'
import { EbookStarter } from '../components/EbookStarter'

function EbookMakerPage() {
  const currentEbook = useStore(ebookStore, (state) =>
    ebookSelectors.getCurrentEbook(state)
  )

  return (
    <div className="h-screen">
      {currentEbook ? <EbookEditor /> : <EbookStarter />}
    </div>
  )
}

export const Route = createFileRoute('/ebook-maker')({
  component: EbookMakerPage,
})
