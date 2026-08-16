import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SettingsProvider } from './lib/settings'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { SurahLayout } from './pages/SurahLayout'
import { ReadView } from './pages/ReadView'
import { WordsView } from './pages/WordsView'
import { TafsirView } from './pages/TafsirView'
import { MindMapView } from './pages/MindMapView'
import { MemorizeView } from './pages/MemorizeView'

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surah/:number" element={<SurahLayout />}>
              <Route index element={<ReadView />} />
              <Route path="words" element={<WordsView />} />
              <Route path="tafsir" element={<TafsirView />} />
              <Route path="mindmap" element={<MindMapView />} />
              <Route path="memorize" element={<MemorizeView />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </HashRouter>
    </SettingsProvider>
  )
}
