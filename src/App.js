import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import 'tachyons';
import Particles from "react-tsparticles";
import './App.css';
import Clarifai from 'clarifai';

const particalesOptions = {
  background: {
    color: {
      value: "none"
    }
  },

  fpsLimit: 60,

  interactivity: {

    events: {

      onClick: {

        enable: true,

        mode: "push"

      },

      onHover: {

        enable: true,

        mode: "repulse"

      },

      resize: true

    },

    modes: {

      bubble: {

        distance: 400,

        duration: 2,

        opacity: 0.8,

        size: 40

      },

      push: {

        quantity: 4

      },

      repulse: {

        distance: 200,

        duration: 0.4

      }

    }

  },

  particles: {

    color: {

      value: "#ffffff"

    },

    links: {

      color: "#ffffff",

      distance: 150,

      enable: true,

      opacity: 0.5,

      width: 1

    },

    collisions: {

      enable: true

    },

    move: {

      direction: "none",

      enable: true,

      outMode: "bounce",

      random: false,

      speed: 3,

      straight: false

    },

    number: {

      density: {

        enable: true,

        area: 800

      },

      value: 50

    },

    opacity: {

      value: 0.5

    },

    shape: {

      type: "circle"

    },

    size: {

      random: true,

      value: 5

    }

  },

  detectRetina: true
}

const app = new Clarifai.App({
 apiKey: 'Add API Key'
});

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signIn',
    isSignedIn: false,
    user: {
      id:  '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    }
  

  loadUser = (data) => {
    this.setState( {user: {
      id:  data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
 
    return {
      leftCol: clarifiFace.left_col * width,
      topRow: clarifiFace.top_row * height,
      rightCol: width - (clarifiFace.right_col * width),
      bottomRow: height - (clarifiFace.bottom_row * height)
    }
  } 

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models
    .predict(
    Clarifai.FACE_DETECT_MODEL,
    this.state.input
    ).then(response => {
      if(response){
        fetch('http://localhost:3001/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)

      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState(initialState);
    }else if (route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }
  
  render(){
    const { isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
        id="tsparticles"
        options={particalesOptions} 
      />

        <Navigation  isSignedIn={isSignedIn} onRouteChange ={this.onRouteChange} />
        { route === 'home' 
          ? <div>
              <Logo /> 
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm
              onInputChange = {this.onInputChange} onPictureSubmit = {this.onPictureSubmit} />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
          </div>
          : (
              route === 'signIn'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
        }
      </div>
    );
  }
 
}
export default App;
