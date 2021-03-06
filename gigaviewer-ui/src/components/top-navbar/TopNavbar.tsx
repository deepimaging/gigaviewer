import React from 'react';
import { useHistory } from 'react-router-dom';

/**
 * Uncomment for navbar items (About, Home, Signup, etc.)
 */
// import NavButton from './NavButton';
// import IconButton from '@material-ui/core/IconButton';
// import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';
// import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
// import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
// import RefreshIcon from '@material-ui/icons/Refresh';
// import FullscreenIcon from '@material-ui/icons/Fullscreen';
// import Box from '@material-ui/core/Box';

import {
  // faTimes,
  // faBars,
  faMicroscope,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { MenuItems } from './utils';
import './style.css';

interface PublicProps {
  isViewerMode?: boolean;
}

/**
 * The static, naviation bar at top of the single page web app
 */
const TopNavbar = (props: PublicProps) => {
  const history = useHistory();
  // const [isMenuIconClicked, setIsMenuIconClicked] = useState(false);

  // const handleMenuIconClicked = () => {
  //   setIsMenuIconClicked(!isMenuIconClicked);
  // };

  const goToHome = () => {
    history.push('');
  }

  return (
    <div>
      {(!props.isViewerMode) 
      
      ? 
      /**
       * DURING NON-VIEWER MODE
       */
      <nav className="navbar-items">
        <h1 className="navbar-logo" onClick={goToHome}>
          Gigaviewer
          <FontAwesomeIcon icon={faMicroscope}/>
        </h1>

        {/* <div className="menu-icon" onClick={handleMenuIconClicked}>
          {isMenuIconClicked ? (
            <FontAwesomeIcon icon={faTimes} />
          ) : (
            <FontAwesomeIcon icon={faBars} />
          )}
        </div>

        <ul className={isMenuIconClicked ? 'nav-menu active' : 'nav-menu'}>
          {MenuItems.map((item, index) => {
            return (
              <li key={index}>
                <a className={item.cName} href={item.url}>
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul> */}

        {/* <div className="navbar-upload">
          <NavButton />
        </div> */}
      </nav>

      : 
      /**
       * DURING VIEWER MODE
       */
      <nav className="navbar-items-viewer">
        <h1 className="navbar-logo-viewer" onClick={goToHome}>
          Gigaviewer
          <FontAwesomeIcon icon={faMicroscope}/>
        </h1>
      </nav>
      }
    </div>
  );
};

export default TopNavbar;
