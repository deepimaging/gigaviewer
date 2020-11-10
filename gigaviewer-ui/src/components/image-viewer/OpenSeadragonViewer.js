import OpenSeaDragon, { World } from 'openseadragon';
import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import HomeIcon from '@material-ui/icons/Home';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const OpenSeadragonViewer = ({ images, frame }) => {
  const classes = useStyles();
  const [viewer, setViewer] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    InitOpenseadragon();

    resizeWindow();
    window.addEventListener('resize', resizeWindow);
    console.log('width: ' + window.innerWidth + ' height: ' + window.innerHeight);

    return () => {
      viewer && viewer.destroy();
      window.removeEventListener('resize', resizeWindow);
    };
  }, []);

  const countFrames = (frames) => {
    var sum = 0;
    for (var i = 0; i < frames.length; + i++) {
      sum++;
    }
    return sum;
  }

  useEffect(() => {
    if (images && viewer) {
      viewer.open(images[0].frame.source);
    }
  }, [images]);

  function resizeWindow() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  const InitOpenseadragon = () => {
    viewer && viewer.destroy();
    const zoomValue = (height-80)/((11146/7479)*width);
    setViewer(
      OpenSeaDragon({
        id: 'openSeaDragon',
        prefixUrl: 'openseadragon-images/',
        animationTime: 0.5,
        blendTime: 0.1,
        maxZoomPixelRatio: 2,
        defaultZoomLevel: zoomValue,
        minZoomLevel: 0.2,
        visibilityRatio: 0.5,
        zoomPerScroll: 2,
        zoomInButton: 'zoom-in',
        zoomOutButton: 'zoom-out',
        homeButton: 'home',
        fullPageButton: 'full-page',
        sequenceMode: 'true', // sequence of images
        nextButton: 'next',
        previousButton: 'previous',
      })
    );
  };

  return (
    <div>
      <Box height={height-80} width={width} id="openSeaDragon">
        <div className={classes.root}>
        <Box position="absolute" top="0%" right="10%" zIndex="tooltip">
            <IconButton color="primary" aria-label="previous" disableRipple="true" id="previous">
              <ArrowBackIcon style={{ fontSize: 30 }} />
            </IconButton>
          </Box>
          <Box position="absolute" top="0%" right="5%" zIndex="tooltip">
            <IconButton color="primary" aria-label="next" disableRipple="true" id="next">
              <ArrowForwardIcon style={{ fontSize: 30 }} />
            </IconButton>
          </Box>
          <Box position="absolute" top="8%" right="0%" zIndex="tooltip">
            <IconButton color="primary" aria-label="zoom in" disableRipple="true" id="zoom-in">
              <AddCircleOutlineIcon style={{ fontSize: 30 }} />
            </IconButton>
          </Box>
          <Box position="absolute" top="16%" right="0%" zIndex="tooltip">
            <IconButton color="primary" aria-label="zoom out" disableRipple="true" id="zoom-out">
              <RemoveCircleOutlineIcon style={{ fontSize: 30 }} />
            </IconButton>
          </Box>
          <Box position="absolute" top="0%" right="0%" zIndex="tooltip">
            <IconButton color="primary" aria-label="default zoom" disableRipple="true" id="home">
              <HomeIcon style={{ fontSize: 30 }} />
            </IconButton>
          </Box>
          <Box position="absolute" top="24%" right="0%" zIndex="tooltip">
            <IconButton color="primary" aria-label="full screen" disableRipple="true" id="full-page">
              <FullscreenIcon style={{ fontSize: 30 }} />
            </IconButton>
          </Box>
        </div>
      </Box>
    </div>
  );
};

export default OpenSeadragonViewer;
