import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import toWav from 'audiobuffer-to-wav';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      recording:false,
      display: true,
      data:''
    }

    setInterval(() => {
      this.setState(previousState => {
        return { display: !previousState.display };
      });
    }, 600);
  }

  componentDidMount(){
    this.player()
  }

  player = () => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(this.handleSuccess);
  }

  handleSuccess = (stream) =>{
    let mediaRecorder = new MediaRecorder(stream);

    let controlStart = true;
    const buttonStart = document.getElementById('start')
    buttonStart.addEventListener('click', () => {
      if(controlStart) {
        mediaRecorder.start();
        controlStart = false;
        this.setState({ recording : true })

      }
    });

    let record
    mediaRecorder.ondataavailable = e => {
      record = e.data
    };

    let controlStop = true;
    const buttonStop = document.getElementById('stop')
    buttonStop.addEventListener('click', () => {
      if(controlStop && !controlStart) {
        mediaRecorder.stop();
        controlStop = false;
        this.setState({ recording : false })
      }
    });

    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = record;
      const reader = new FileReader();
      reader.readAsArrayBuffer(audioBlob); //blob2buffer
      reader.onloadend = () => {
        const arrayBuffer = reader.result;
        const context = new AudioContext();
        context.decodeAudioData(arrayBuffer, buffer => {
          const wav = toWav(buffer); //Audiobuffer2Wav

          const blob = new Blob([new Uint8Array(wav)]); //create blob to send to
                                                        //the server
          let formData = new FormData();
          formData.append('audio', blob);
          const url = 'http://localhost:8080/';
          axios.post(url, formData)
            .then((result) => {
              console.log(result);
              this.setState({ data : result.data })
            })
            .catch(error=>console.log(error))
        })
      };
      mediaRecorder = '';
    });
  }

  render() {
    return (
      <div className='App'>
        <div className='Header'>Voice to Text </div>
        <div className='Body'>
          <div>
            <button id='start'>Start</button>
            &nbsp;
            <button id='stop'>Stop</button>
          </div>
          {this.state.recording
            ?
              <div>
              {this.state.display
                ?
                  'recording ...'
                :
                  <br/>
              }
              </div>
            : <br/>
          }
          {this.state.data
            ?
              this.state.data
            :
            <br/>
          }
        </div>
      </div>
    );
  }
}

export default App;
