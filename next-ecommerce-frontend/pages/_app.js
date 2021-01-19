import Header from '../components/header';
import Footer from '../components/footer';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <main>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </main>
    </AuthProvider>
  );
}

export default MyApp;
