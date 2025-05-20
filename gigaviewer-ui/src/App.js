import React, {useState} from 'react';

import {Viewer} from './pages';
import {TopNavbar} from './components/top-navbar';
import {Route, Switch, useParams, Redirect} from 'react-router-dom';
import { ImageGrid as Grid } from 'components/grid-view';
import {url, url_orig} from "url.js"

import './App.css';

// const data_path = url + "/test.json"
const data_path = url + "/imageMetadata.json"
let data = null;

const App = () => {
    const [is_data, setData] = useState();

    if ( ! is_data)
    {
      fetch(data_path).then( async (response) => {
        data = await response.json();
        setData(true);
      });
      return <div>Loading</div>;
    }

    return (
        <div className="App">
            <Switch>
                {/*Render image*/}
                <Route
                    path="/viewer/:teamId/:projectId/:captureId/:frameId"
                    children={<RenderViewer/>}
                />
                {/*Render a single Project*/}
                <Route
                    path="/team/:teamId/:projectId"
                    children={<RenderProjectBrowser/>}
                />
                {/*Render a single Team*/}
                <Route
                    path="/team/:teamId"
                    children={<RenderTeamBrowser/>}
                />
                {/*Redirect to page from tag*/}
                <Route
                    path="/tag/:tag"
                    children={<RenderFromTag/>}
                />
                {/*Home Page*/}
                <Route
                    path="/"
                    children={<RenderBrowser/>}/>
            </Switch>
        </div>
    );
};


function RenderBrowser(){
    let tmp = { groups: {...data.groups}};
    delete tmp.groups["Sandbox"];
    return (
        <div>
            <TopNavbar path={[]} />
            <br/>
            <center>
            <h2>Multi-Gigapixel Video Viewing Platform</h2>
            <h3>Duke University Computational Optics Lab</h3>
            </center><br/>
            <Grid gridData={tmp}/>
            <br/>
            <center>
            <div class="widget">
            <p>
                Welcome to the <a href = "http://horstmeyer.pratt.duke.edu/">
                Computational Optics Lab's</a> gigapixel video viewing platform,
                through which we can present raw and final composite images captured
                by our suite of multi-camera array microscopes. Please refer to the
                following publications listed below for additional information about
                this collection of computational microscopes, as well as
                our <a href = "https://mcam.deepimaging.io/">project page</a>.
                Additional information about this technology can also be found
                at <a href = "https://ramonaoptics.com/">Ramona Optics</a>.
            </p>
            <br/><ul className='pub'>
                
                <Pub authors={"K. C. Zhou, M. Harfouche, C. L. Cooke, J. Park, P. C. Konda, "+
                              "L. Kreiss, K. Kim, J. Jönsson, T. Doman, P. Reamey, V. Saliu, "+
                              "C. B. Cook, M. Zheng, J. P. Bechtel, A. Begue, M. McCarroll, "+
                              "J. Bagwell, G. Horstmeyer, M. Bagnat and R. Horstmeyer"}
                     title="Parallelized computational 3D video microscopy of freely moving organisms at multiple gigapixels per second"
                     publisher="Accepted to Nature Photonics"
                     // link="https://gigazoom.rc.duke.edu/"
                     year={2023}
                     project="MCAM-54" />
                
                <Pub authors={"M. Harfouche, K. Kim, P. C. Konda, S. Sharma, E. E. Thomson, "+
                              "K. C. Zhou, C. Cooke, S. Xu, X. Yang, X. Yao, V. Pathak, "+
                              "R. Appel. C. Cooke, J. Doman, G. Horstmeyer, J. Park, P. Reamey, "+
                              "V. Saliu, E. Naumann and R. Horstmeyer"}
                     title="Multi-scale gigapixel microscopy using a multi-camera array microscope"
                     publisher="Accepted to Optica"
                     // link="https://gigazoom.rc.duke.edu/"
                     year={2023}
                     project="MCAM-54" />
                
                <Pub authors="X. Yang, M. Harfouche, K. C. Zhou, L. Kreiss, S. Xu, K. Kim, R. Horstmeyer"
                     title="Multimodal imaging using a cascaded microscope design"
                     publisher="Accepted to Optics Letters"
                     // link="https://gigazoom.rc.duke.edu/"
                     year={2023}
                     project="MCAM-96" />
                
                <Pub authors={"E. E. Thomson, M. Harfouche, P. C Konda, C. Seitz, K. Kim, "+
                              "C. Cooke, S. Xu, R. Blazing, Y. Chen, W. S. Jacobs, S. Sharma, "+
                              "T. W. Dunn, J. Park, R. Horstmeyer*  and E. A. Naumann*"}
                     title="Gigapixel imaging with a novel multi-camera array microscope"
                     publisher="eLife 11, e74988"
                     link="https://doi.org/10.7554/eLife.74988"
                     year={2022}
                     project="MCAM-96"
                     other="(*co-corresponding authors)" />
                
            </ul>
            </div>
            </center>
        </div>
    );
}

class Pub extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = { is_visible: false };
  }

  render() {
    const title = this.props.title;
    const authors = this.props.authors;
    const year = this.props.year;
    const publisher = this.props.publisher;
    const other = this.props.other;
    const link = this.props.link;
    const project = this.props.project;

    const set = () => this.setState( { is_visible: true } );

    const setPrj = () => project ? <b>({project}) </b> : "";
    const setLink = (text="Link") => link ? <a href={link} target="_blank">{text}</a> : "";
    const setOther = () => other ? <div><i>{other}</i></div> : "";

    if ( this.state.is_visible )
      return <li>
        <div>{setPrj()}</div>
        {authors}, <b><q>{title}</q></b>,&nbsp;
        {publisher} ({year}){setOther()}
        <div>{setLink(link)}</div>
      </li>;
    else
      return <li>
          <span onClick={set}>{setPrj()}
            <b><q>{title}</q></b>, {publisher} ({year})
          </span> {setLink()}
        </li>;
  }
}

function RenderTeamBrowser(){
    console.log("render team");
    const {teamId} = useParams();
    return (
        <div>
          <TopNavbar path={[teamId]} tag={data.groups[teamId].tag} />
          <Grid teamId={teamId} gridData={data.groups[teamId]}/>
        </div>
    );
}

function find_tag(tag, obj=data, path="")
{
  if ( obj == null )
    return null;
  
  if ( obj.tag == tag )
  {
    // console.log("Found link for", {tag, obj, path});

    return obj.kind == "capture" ? "viewer"+path+"/0" :
           obj.kind ==null ? path : "team"+path;;
  }

  for ( let key in obj.groups)
  {
    let res = find_tag(tag, obj.groups[key], path+"/"+key);

    if ( res != null )
      return res;
    
    // console.log("No link at", path);
  }

  // console.log("No link at", path);

  return null;
}

function RenderFromTag(){
  console.log("render direct link");
  let {tag} = useParams();
  tag = tag.toUpperCase()

  let res = find_tag(tag);

  if ( res != null )
  {
    return (
      <Redirect to={"/" + url_orig + res} />
    );
  }
  else
  {
    return (
    <div>
    <TopNavbar path={[]}/>
    <center><b>
      <br /><div>
        Tag not found "{tag}".
      </div>
    </b></center>
    </div>
    );
  }
}

function RenderProjectBrowser(){
    const {teamId, projectId} = useParams();
    const teamData = data.groups[teamId];
    const gridData = teamData.groups[projectId];

    return (
        <div>
             <TopNavbar path={[teamId, projectId]} tag={gridData.tag}/>
            <Grid teamId={teamId} projectId={projectId} gridData={gridData}/>
        </div>
    );
}

function RenderViewer() {
    const {teamId, projectId, captureId, frameId} = useParams();

    const projectData =  data.groups[teamId].groups[projectId];
    const captureData = projectData.groups[captureId];

    const imageSources = captureData.sources;
    const frameNumber = parseInt(frameId);
    const title = captureId;
    // const height = captureData.hasOwnProperty("height") ? captureData.height : 0;

    // Hardcoded height value as there are no metadata.json to grab it from.
    const height = 0.07424;

    return (
      <div>
        <TopNavbar path={[teamId, projectId]} tag={captureData.tag}/>
        <Viewer imageSources={imageSources} title={title} height={height} idx={frameNumber}/>
      </div>
    );
}

export default App;
