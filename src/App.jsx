import Capabilities from './components/Capabilities.jsx'
import Faq from './components/Faq.jsx'
import Footer from './components/Footer.jsx'
import Hero, { Marquee } from './components/Hero.jsx'
import How from './components/How.jsx'
import Nav, { MobileBar, ScrollProgress } from './components/Nav.jsx'
import Objections from './components/Objections.jsx'
import Pricing from './components/Pricing.jsx'
import Product from './components/Product.jsx'
import Roi from './components/Roi.jsx'
import SplitCall from './components/SplitCall.jsx'
import Start from './components/Start.jsx'
import Studio from './components/Studio.jsx'

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <SplitCall />
        <Product />
        <Studio />
        <How />
        <Capabilities />
        <Roi />
        <Pricing />
        <Objections />
        <Faq />
        <Start />
      </main>
      <Footer />
      <MobileBar />
    </>
  )
}
