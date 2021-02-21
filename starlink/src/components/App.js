import logo from '../assets/images/logo.svg';
import '../styles/App.css';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';

/*入口文件*/
function App() {
  return (
    <div className="App">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

export default App;
