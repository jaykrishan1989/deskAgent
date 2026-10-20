import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Enquire from './pages/Enquire.jsx'
import Home from './pages/Home.jsx'
import PricingPage from './pages/PricingPage.jsx'
import Questions from './pages/Questions.jsx'
import Service from './pages/Service.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="service" element={<Service />} />
          <Route path="calls" element={<Navigate to="/" replace />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="questions" element={<Questions />} />
          <Route path="enquire" element={<Enquire />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
