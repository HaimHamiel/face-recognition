import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
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

  fpsLimit: 120,

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
class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
    }
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

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models
    .predict(
    Clarifai.FACE_DETECT_MODEL,
    this.state.input
    ).then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
    .catch(err => console.log(err));
  }
  
  render(){
    return (
      <div className="App">
        <Particles className='particles'
        id="tsparticles"
        options={particalesOptions} 
      />
        <Navigation />
         <Logo />
         <Rank />
        <ImageLinkForm
         onInputChange = {this.onInputChange} onButtonSubmit = {this.onButtonSubmit} />
        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
      </div>
    );
  }
 
}

export default App;
