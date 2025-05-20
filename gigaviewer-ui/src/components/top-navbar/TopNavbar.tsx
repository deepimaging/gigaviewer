import React from 'react';
import { useHistory } from 'react-router-dom';
import {url_orig} from "url.js"
import {NavBar} from "./NavBar.js"

import {
  faMicroscope,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './style.css';

interface PublicProps {
  isViewerMode?: boolean;
  path: string[];
  tag?: string;
}

/**
 * The static, naviation bar at top of the single page web app
 */
const TopNavbar = (props: PublicProps) => {
  const history = useHistory();

  const goToHome = () => {
    history.push(url_orig);
  }

  const style = {
    display : props.tag == null || props.tag == "" ? "none" : ""
  };

  return (
    <div>
      
      <nav className="navbar-items">
        <h1 className="navbar-logo" onClick={goToHome}>
          Gigaviewer <FontAwesomeIcon icon={faMicroscope}/>
        </h1>

        <NavBar path={props.path} />

        <div style={{ flexGrow: 1 }}></div>

        <a className="navbar-items-tag" href={"/" + url_orig + "tag/" + props.tag}>
          <h2 style={style}>#{props.tag}</h2>
        </a>
      </nav>
    
    </div>
  );
};

export default TopNavbar;
