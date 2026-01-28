import Header from './Header';
import '../../styles/Layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main-content">
        {children}
      </main>
    </div>
  );
}
