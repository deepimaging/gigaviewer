import React, {useState} from 'react';
import { Link } from "react-router-dom";

import {
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const style =
{
  display : "flex",
  gap:"1em",
  color: "white",
}

const style_item = 
{
  maxWidth : "10em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontWeight: "bold",
  color: "white",
}

class NavBar extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = {};
  }

  render() {
    
    let array = this.props.path;

    const setItem = (item, index) =>
    {
      const path = index == 0 ?
        `/team/${array[0]}` :
        `/team/${array[0]}/${array[1]}`

      return [
        <FontAwesomeIcon icon={faAngleRight}/>,
        <Link to={path} style={{textDecoration: "none"}}>
          <div style={style_item}>{item}</div>
        </Link>
      ]
    }

    if (array.length)
    return <div style={style}>
      {array.map(setItem)}
      <FontAwesomeIcon icon={faAngleRight}/>
    </div>
    else
      return <div></div>
  }
}

export {NavBar};