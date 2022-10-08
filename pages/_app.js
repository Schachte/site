
import '../styles/globals.css'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'

function Blog({ Component, pageProps }) {
  return (
  <div className="container">
    <Header />
    <Component {...pageProps} />
    <Footer />
  </div>
  )
}

export default Blog
