import React, {useEffect, useRef, useState} from 'react';
import {useHistory, useLocation} from 'react-router-dom';

import OpenSeaDragon from 'openseadragon';
import '@openseadragon-imaging/openseadragon-imaginghelper';

import {getScalebarSizeAndTextForMetric} from './utils';
import Draggable from 'react-draggable';
import {url, url_orig} from "url.js"

import {
    Box,
    Button,
    CircularProgress,
    IconButton, Input, LinearProgress,
    makeStyles,
    Modal,
    Slider,
    Typography,
    withStyles,
} from '@material-ui/core';

import RotateRightIcon from '@material-ui/icons/RotateRight';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import CodeIcon from '@material-ui/icons/Code';
import DetailsIcon from '@material-ui/icons/Details';
import {green} from '@material-ui/core/colors';
import clsx from 'clsx';


const useStyles = makeStyles((theme) => ({
    root: {
        width: 300,
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }, wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
        boxSizing: 'border-box'
    }, buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '25%',
        left: '25%',
        marginTop: 0,
        marginLeft: 0,
    }, buttonSuccess: {
        width: '100%',
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
}));

const style_title = {
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  borderRadius: "0.5em",
  paddingLeft: "0.3em",
//   boxShadow: "2px 2px 10px #8080804d",
  paddingRight: "0.3em",
};

const PrettoSlider = withStyles({
    root: {
        color: 'primary',
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 4px)',
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        opacity: 0.6,
    },
})(Slider);


const useKeyPress = (targetKey) => {
    const [keyPressed, setKeyPressed] = useState(false);

    const downHandler = (key) => {
        if (key.code === targetKey) {
            setKeyPressed(true);
        }
    };

    const upHandler = (key) => {
        if (key.code === targetKey) {
            setKeyPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    });

    return keyPressed;
};

/**
 * This component takes in the relevant frames and initializes them to an OSD viewer
 * @param {*} param0
 */
const OpenSeadragonViewer = ({sources, realImageHeight, initialFrame, collectionTitle}) => {
    const location = useLocation();
    const history = useHistory();
    const imageHeight = realImageHeight;
    // const currPage = location.href;

    const classes = useStyles();
    const [viewer, setViewer] = useState(null);
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    // const [defaultZoom, setDefaultZoom] = useState(0);
    const [scalebarSize, setScalebarSize] = useState(0);
    const [scalebarText, setScalebarText] = useState('');
    const [index, setIndex] = useState(Number(initialFrame));
    const [totalFrames, setTotalFrames] = useState(0);
    const [isPlaybackEnabled, setIsPlaybackEnabled] = useState(true);
    const [isSliderEnabled, setIsSliderEnabled] = useState(false);
    const [playbackIntervalId, setPlaybackIntervalId] = useState();
    const [zoomLevel, setZoomLevel] = useState();
    const [currSliderValue, setCurrSliderValue] = useState(Number(initialFrame));
    const [commitSliderValue, setCommitSliderValue] = useState(0);
    const [modalStyle] = useState(getModalStyle);
    const [open, setOpen] = useState(false);
    const [cacheSliderValue, setCacheSliderValue] = useState(10)
    const [isCaching, setIsCaching] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(3);
    // const [isRedirecting, setIsRedirecting] = useState(false);
    const [activeDrags, setActiveDrags] = useState(0);
    const [rightImage, setRightImage] = useState(null);
    const [staticDeltaX, setStaticDeltaX] = useState(0);
    const [isNewDrag, setIsNewDrag] = useState(false);

    const leftBoundPx = useRef(0);
    const rightBoundPx = useRef(0);

    const leftPress = useKeyPress('ArrowLeft');
    const rightPress = useKeyPress('ArrowRight');

    let currentZoom = 0;
    let defaultZoom = 0;
    let changedFrame = true;
    let rightRect = new OpenSeaDragon.Rect(6500, 0, 6500, 16000);
    let newRect = new OpenSeaDragon.Rect(0, 0, 0, 0);
    let oldSpringX = 0.5;
    let deltaX = staticDeltaX;
    const middle = new OpenSeaDragon.Point(width / 2, height / 2);
    const leftBound = new OpenSeaDragon.Point(0, 0);
    const rightBound = new OpenSeaDragon.Point(13000, 0);

    function getPath(tileSources)
    {
        let pathname = window.location.pathname.slice(url_orig.length);
        pathname = pathname.slice(0, pathname.lastIndexOf('/'));
        pathname = pathname.replace("/viewer/", "/auto/")

        if ( Array.isArray(tileSources) )
          return tileSources.map( val => `${url+url_orig}${pathname}/${val}` );
        else
          return [`${url+url_orig}${pathname}/${tileSources}`];
    }

    useEffect(() => {
        if (sources) {
            if (sources.length > 0) {
                const tempTotal = sources[0].tileSources.length;
                setTotalFrames(tempTotal);
                setCacheSliderValue(10 > tempTotal ? tempTotal : 10);

                InitOpenseadragon( getPath(sources[0].tileSources) );
                setFrameAtIndex(0, 0, sources[0].tileSources.length);
            }
            resizeWindow();
            window.addEventListener('resize', resizeWindow);
            return () => {
                viewer && viewer.destroy();
                window.removeEventListener('resize', resizeWindow);
            };
        }
    }, [sources]);

    useEffect(() => {
        history.push(`${location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1)}${index}`);
    }, [index]);


    useEffect(() => {
        if (viewer != null && activeDrags == 0) {
            viewer.activateImagingHelper({
                onImageViewChanged,
            });
        }
    }, [viewer]);

    useEffect(() => {
        if (viewer != null && rightImage != null) {
            setBounds();
            handleDrag();
        }
    }, [rightImage]);

    useEffect(() => {
        if (viewer != null) {
            // remove the inner keydown handler from OSD
            viewer.innerTracker.keyDownHandler = null;
            viewer.innerTracker.keyPressHandler = null;
            console.log("removing inner tracker");
        }
    }, [viewer])

    useEffect(() => {
        if (leftPress) {

            previousFrame();
        }
    }, [leftPress]);

    useEffect(() => {
        if (rightPress) {
            nextFrame();
        }
    }, [rightPress]);

    const handleChange = (event, newSliderValue) => {
        setCurrSliderValue(newSliderValue);
    };

    const handleCommit = () => {
        if (currSliderValue !== commitSliderValue) {
            setFrameAtIndex(commitSliderValue, currSliderValue, totalFrames);
        }
        setCommitSliderValue(currSliderValue);
    };

    const previousFrame = () => {
        let newIndex = index === 0 ? totalFrames - 1 : index - 1;
        setFrameAtIndex(index, newIndex, totalFrames);
        setCurrSliderValue(newIndex);
        setCommitSliderValue(newIndex);
    };

    const nextFrame = () => {
        let oldIndex = index;
        let newIndex = (index + 1) % totalFrames;
        setFrameAtIndex(oldIndex, newIndex, totalFrames);
        setCurrSliderValue(newIndex);
        setCommitSliderValue(newIndex);
    };

    const setFrameAtIndex = (oldIndex, newIndex, totalFrames) => {
        setIndex(newIndex);
        changedFrame = true;
        let nextIndex = (newIndex + 1) % totalFrames;
        if (oldIndex !== newIndex) {
            // Make the prev image go away
            viewer.world.getItemAt(oldIndex).setOpacity(0);
            // Stop pre-loading it
            viewer.world.getItemAt(oldIndex).setPreload(false);
            // Reveal the new image
            viewer.world.getItemAt(newIndex).setOpacity(1);
            // Preload the next image
            viewer.world.getItemAt(nextIndex).setPreload(true);
        }
    };

    const startSlowZoom = () => {
        const viewport = viewer.viewport;
        const oldTime = viewport.zoomSpring.animationTime;
        const oldSpring = viewport.zoomSpring.springStiffness;
        viewport.zoomSpring.animationTime = 10;
        viewport.zoomSpring.springStiffness = 1;
        viewport.zoomTo(viewport.getMaxZoom());
        const delay = 10000;
        setTimeout(() => {
            viewport.zoomSpring.animationTime = oldTime;
            viewport.zoomSpring.springStiffness = oldSpring;
        }, delay)
    }

    const startPlayback = () => {
        const delay = 1000 / playbackSpeed;

        setPlaybackIntervalId(
            setTimeout(function clicker() {
                const next_button = document.getElementById('next');
                if (next_button) {
                    next_button.click();
                    setPlaybackIntervalId(setTimeout(clicker, delay));
                }
            }, delay)
        );
    };

    const stopPlayback = () => {
        clearTimeout(playbackIntervalId);
    };

    const modelOpen = () => {
        setOpen(true);
    };

    const handlePrecacheSliderChange = (event, newValue) => {
        setCacheSliderValue(newValue);
    };

    const modalClose = () => {
        setOpen(false);
    };

    const startPrecache = () => {
        setIsCaching(true);
    }

    useEffect(() => {
        if (isCaching) {
            precacheData(cacheSliderValue);
        } else {
            modalClose();
        }
    }, [isCaching])
    const buttonClassname = clsx({
        [classes.buttonSuccess]: isCaching,
    });
    const precacheData = (cacheAmnt) => {
        let cacheIndex = currSliderValue;
        console.log("pre cache...");
        console.log(cacheSliderValue);
        let item = null;
        let lastItem = null;
        for (let i = 0; i < cacheAmnt; i++) {
            cacheIndex = (cacheIndex + 1) % totalFrames
            item = viewer.world.getItemAt(cacheIndex)
            if (!item._fullyLoaded) {
                item.setPreload(true);
                lastItem = item;
                item.addOnceHandler("fully-loaded-change", (event) => {
                    event.eventSource.setPreload(false);
                })
            }
        }
        if (lastItem === null) {
            setIsCaching(false);
        } else {
            lastItem.addOnceHandler("fully-loaded-change", () => {
                setIsCaching(false);
            })
        }
        console.log("done")
    };

    const togglePlayback = () => {
        setIsPlaybackEnabled(!isPlaybackEnabled);
        if (isPlaybackEnabled) {
            startPlayback();
        } else {
            stopPlayback();
        }
    };
    const toggleSlider = () => {
        return;
        // setIsSliderEnabled(!isSliderEnabled);
        // if (isSliderEnabled) {
        //   // rightImage.setOpacity(0);
        //   viewer.world.removeItem(rightImage);
        //   setRightImage(null);
        // } else {
        //   // rightImage.setOpacity(1);
        //   viewer.addTiledImage({
        //     tileSource:
        //       'https://gigazoom.rc.duke.edu/auto/Falcon-Target/usaf_target_100ms_20201120_163634_914_stitched_12012020.dzi',
        //     x: 0,
        //     y: 0,
        //     width: 1,
        //     clip: rightRect,
        //     opacity: 1,
        //     success: function (event) {
        //       if (rightImage == null) {
        //         setRightImage(event.item);
        //       }
        //     },
        //   });
        // }
    };

    const onImageViewChanged = () => {
        if (changedFrame) {
            defaultZoom = viewer.viewport.getZoom();
            changedFrame = false;
        }
        currentZoom = viewer.viewport.getZoom();
        const canvasHeight = viewer.canvas.clientHeight;
        const scaleBarSpecs = getScalebarSizeAndTextForMetric(
            (canvasHeight) / imageHeight / (defaultZoom / currentZoom),
            100
        );
        if (rightImage != null) setBounds();
    };

    const setBounds = () => {
        leftBoundPx.current =
            rightImage.imageToWindowCoordinates(leftBound).x - middle.x;
        rightBoundPx.current =
            rightImage.imageToWindowCoordinates(rightBound).x - middle.x;
    };

    const resizeWindow = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    const handleDrag = (e, ui) => {
        if (isNewDrag) {
            deltaX = staticDeltaX;
            setIsNewDrag(false);
        }

        deltaX = ui != null ? ui.x : deltaX;
        const newMiddle = new OpenSeaDragon.Point(width / 2 + deltaX, height / 2);

        if (rightImage != null) {
            const lox = rightImage.viewerElementToImageCoordinates(newMiddle).x;
            const imageWidth = rightImage.getContentSize().x;
            const newWidth = lox < 0 ? imageWidth - lox : imageWidth;
            newRect = new OpenSeaDragon.Rect(lox, 0, newWidth, 16000);
            rightImage.setClip(newRect);
        }
        viewer.addHandler('animation', imagesClipAggressive);
        viewer.addHandler('animation-start', imagesClip);
    };

    const imagesClip = () => {
        const newMiddle = new OpenSeaDragon.Point(width / 2 + deltaX, height / 2);
        const rox = rightImage.viewportToImageCoordinates(newMiddle).x;
        const imageWidth = rightImage.getContentSize().x;
        const newWidth = rox < 0 ? imageWidth - rox : imageWidth;
        newRect = new OpenSeaDragon.Rect(rox, 0, newWidth, 16000);
        rightImage.setClip(newRect);
    };

    const imagesClipAggressive = () => {
        const newSpringX = viewer.viewport.centerSpringX.current.value;
        const deltaSpringX = newSpringX - oldSpringX;
        oldSpringX = newSpringX;

        const newMiddle = new OpenSeaDragon.Point(width / 2 + deltaX, height / 2);
        const fixedMiddle = viewer.viewport.viewerElementToViewportCoordinates(
            newMiddle
        );
        fixedMiddle.x += deltaSpringX;
        const imageWidth = rightImage.getContentSize().x;
        const rox = rightImage.viewportToImageCoordinates(fixedMiddle).x;

        const newWidth = rox < 0 ? imageWidth - rox : imageWidth;
        newRect = new OpenSeaDragon.Rect(rox, 0, newWidth, 16000);
        rightImage.setClip(newRect);
    };

    const onStart = () => {
        deltaX = staticDeltaX;
        setActiveDrags(1);
        setIsNewDrag(true);
    };

    const onStop = () => {
        setActiveDrags(0);
        setStaticDeltaX(deltaX);
        setIsNewDrag(true);
    };

    const InitOpenseadragon = (tileSources) => {
        viewer && viewer.destroy();

        tileSources = tileSources.map(function (tileSource, i) {
            return {
                tileSource: tileSource,
                opacity: i === 0 ? 1 : 0,
                preload: i === 1,
            };
        });

        setViewer(
            OpenSeaDragon({
                tileSources: tileSources,
                id: 'openSeaDragon',
                prefixUrl:
                    'http://cdn.jsdelivr.net/npm/openseadragon@2.3/build/openseadragon/images/',
                maxZoomPixelRatio: 8,
                showNavigator: true,
                maxImageCacheCount: 4096,
                navigatorPosition: 'BOTTOM_LEFT',
                loadTilesWithAjax: true,
                preload: true,
                showSequenceControl: false,
                showRotationControl: true,
                rotateRightButton: 'rotate-right',
                zoomInButton: 'zoom-in',
                zoomOutButton: 'zoom-out',
                homeButton: 'home',
                fullPageButton: 'full-page',
                preserveViewport: true,
            })
        );

    };

    function getModalStyle() {
        const top = 50;
        const left = 50;

        return {
            top: `${top}%`,
            left: `${left}%`,
            transform: `translate(-${top}%, -${left}%)`,
        };
    }

    return (
        <div>
            <Box height={height - 90} width={width} id="openSeaDragon">
                {isSliderEnabled && <div>
                    <Draggable
                        onDrag={handleDrag}
                        onStart={onStart}
                        onStop={onStop}
                        axis="x"
                        bounds={{left: leftBoundPx.current, right: rightBoundPx.current}}
                    >
                        <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            display="flex"
                            paddingRight="10%"
                            paddingBottom="10%"
                            alignItems="center"
                            justifyContent="center"
                            width="1%"
                            height="1%"
                            zIndex="tooltip"
                        >
                            <IconButton
                                color="primary"
                                variant="outlined"
                                size="small"
                                style={{
                                    backgroundColor: 'white',
                                    border: '3px solid',
                                    borderColor: '#3f50b5',
                                }}
                                disableRipple={true}
                            >
                                <CodeIcon style={{fontSize: 40}}/>
                            </IconButton>
                        </Box>
                    </Draggable>
                </div>}

                <div className={classes.root}>
                    <Box flexDirection="column" position="absolute" top="0%" right="1%" zIndex="tooltip"
                         justifyContent="center" className="viewer-control" >
                        <h1 style={style_title}>{collectionTitle}</h1>
                        {totalFrames > 1 &&
                        <div>
                            <Box display="flex" flexDirection="row" justifyContent="center">
                                <IconButton
                                    color="primary"
                                    aria-label="previous"
                                    disableRipple={true}
                                    id="previous"
                                    onClick={previousFrame}
                                >
                                    <ArrowBackIcon style={{fontSize: 30}}/>
                                </IconButton>

                                <IconButton color="primary"
                                            aria-label="previous"
                                            disableRipple={true}
                                            id="play"
                                            onClick={modelOpen}
                                >
                                    <SystemUpdateAltIcon style={{fontSize: 30}}/>
                                </IconButton>
                                <IconButton color="primary"
                                            aria-label="previous"
                                            disableRipple={true}
                                            id="play"
                                            onClick={togglePlayback}
                                >
                                    {isPlaybackEnabled ? <PlayArrow style={{fontSize: 30}}/> :
                                        <Pause style={{fontSize: 30}}/>}
                                </IconButton>
                                <Input
                                    // className={classes.input}
                                    value={playbackSpeed}
                                    margin="dense"
                                    onChange={(event) => {
                                        let value = 1;
                                        if (event.target.value !== '') {
                                            value = event.target.value;
                                        }
                                        if (value > 30) {
                                            value = 30;
                                        }
                                        setPlaybackSpeed(value);
                                    }}
                                    // onBlur={handleBlur}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                        max: 30,
                                        type: 'number',
                                        style: {width: 35}
                                    }}
                                />
                                <IconButton
                                    color="primary"
                                    aria-label="next"
                                    disableRipple={true}
                                    id="next"
                                    onClick={nextFrame}
                                >
                                    <ArrowForwardIcon style={{fontSize: 30}}/>
                                </IconButton>
                            </Box>
                            <PrettoSlider
                                defaultValue={0}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="auto"
                                value={currSliderValue}
                                step={1}
                                onChange={handleChange}
                                onChangeCommitted={handleCommit}
                                min={0}
                                max={totalFrames - 1}
                            />
                        </div>}
                        <Box display="flex" style={{float: "right"}} flexDirection="column" alignContent="flex-end"
                             justifyContent="left" width="10%">
                            <IconButton
                                color="primary"
                                aria-label="rotate right"
                                disableRipple={true}
                                id="rotate-right"
                            >
                                <RotateRightIcon style={{fontSize: 30}}/>
                            </IconButton>
                            <IconButton
                                color="primary"
                                aria-label="full screen"
                                disableRipple={true}
                                id="full-page"
                            >
                                <FullscreenIcon style={{fontSize: 30}}/>
                            </IconButton>
                            <IconButton
                                color="primary"
                                aria-label="zoom in"
                                disableRipple={true}
                                id="zoom-in"
                            >
                                <AddCircleOutlineIcon style={{fontSize: 30}}/>
                            </IconButton>
                            <IconButton
                                color="primary"
                                aria-label="zoom out"
                                disableRipple={true}
                                id="zoom-out"
                            >
                                <RemoveCircleOutlineIcon style={{fontSize: 30}}/>
                            </IconButton>

                            <IconButton
                                color="primary"
                                aria-label="default zoom"
                                disableRipple={true}
                                id="home"
                            >
                                <ZoomOutMapIcon style={{fontSize: 30}}/>
                            </IconButton>
                            <IconButton
                                color="primary"
                                disableRipple={true}
                                id="max-zoom-in"
                                onClick={startSlowZoom}
                            >
                                <DetailsIcon style={{fontSize: 30}}/>
                            </IconButton>
                        </Box>
                    </Box>

                    {scalebarSize === 0 ? null : (
                        <Box
                            border={1}
                            borderTop={0}
                            bgcolor="rgba(255, 255, 255, 0.5)"
                            width={scalebarSize}
                            position="absolute"
                            bottom="0%"
                            left="44%"
                            zIndex="tooltip"
                            style={{
                                borderRight: '3px solid',
                                borderLeft: '3px solid',
                                borderBottom: '3px solid',
                                textAlign: 'center',
                            }}
                        >
                            {scalebarText}
                        </Box>
                    )}
                </div>
            </Box>
            <Modal
                open={open}
                onClose={modalClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={modalStyle} className={classes.paper}>
                    <h2 id="simple-modal-title">Preload area?</h2>
                    <Typography id="range-slider" gutterBottom>
                        Cache Amount
                    </Typography>
                    <PrettoSlider
                        aria-labelledby="discrete-slider"
                        valueLabelDisplay="auto"
                        value={cacheSliderValue}
                        step={1}
                        onChange={handlePrecacheSliderChange}
                        min={1}
                        max={totalFrames}
                    />
                    <div className={classes.wrapper}>
                        <Button
                            variant="contained"
                            color="primary"
                            width="100%"
                            className={buttonClassname}
                            disabled={isCaching}
                            onClick={startPrecache}
                        >
                            Start Precaching
                        </Button>
                        {isCaching && <CircularProgress size={24} className={classes.buttonProgress}/>}
                    </div>

                </div>
            </Modal>
        </div>
    );
};

export default React.memo(OpenSeadragonViewer);
