import React from 'react';
import {url, url_orig} from "url.js"

class ImageThumb extends React.Component
{
  // constructor(props:ImageThumbProps)
  // {
  //   console.log(props)
  //   super(props);
  //   // this.props = props;
  //   // this.state = { is_visible: false };
  // }

  render()
  {
    const img = this.props.img;

    const size = img.length == 1 ? 300 : 150;

    const style = {
      display : "flex",
      width: "300px",
      height: "300px",
      flexWrap: "wrap",
    }

    const style_img = {
      width : `${size}px`,
      height : `${size}px`,
    }

    const createImg = (path) => <img style={style_img} src={path}/>;
    
    return <div style={style}>{img.map(createImg)}</div>
  }
}
function getThumbnailArray(obj, key)
{
  let pathname = window.location.pathname.slice(url_orig.length);
  if (pathname.startsWith("/team/"))
    pathname = pathname.replace("/team/", "/auto/");
  else
    pathname = "/auto";

  let path = url + url_orig + pathname+"/"+key;
  let img_array = []

  function locateTumbs(obj, path)
  {
    if ( obj.thumbnailImg )
    {
      img_array.push( path + "/" + obj.thumbnailImg )

      if ( img_array.length == 4 )
        return;
    }

    if ( obj.groups )
    {
      for (const key in obj.groups)
      {
        locateTumbs(obj.groups[key], path+"/"+key)

        if ( img_array.length == 4 )
          return;
      }
    }
  }

  locateTumbs(obj.groups[key], path);
  return img_array;
}

export {ImageThumb, getThumbnailArray};