import React from 'react';
import {OpenSeaDragonViewer} from 'components/image-viewer';
import Box from '@material-ui/core/Box';

/**
 * viewer page component
 * @param props contains groupId, frame of props.match.params
 */
const Viewer = (props: any) => {
    const imageSources = props.imageSources;
    const title = props.title;
    const realHeight = props.height;
    const initialFrame = props.idx;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            <div>
                <Box position="absolute" left="0%" zIndex="modal">
                    <OpenSeaDragonViewer sources={imageSources} realImageHeight={realHeight} collectionTitle={title}
                                         initialFrame={initialFrame}/>
                </Box>
            </div>
        </div>
    );
};

export default Viewer;
