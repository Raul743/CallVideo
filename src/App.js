import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/icons/IconButton';
import TextField from '@material-ui/core/TextField';
import AssigmentIcon from '@material-ui/icons/Assessment';
import phoneIcon from '@material-ui/icons/Phone';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect('http://localhost:5000');
function App() {
  const [me, setMe] = useState('');
  const [stream, setStream] = useState();
  const [receivingCall, setreceivingCall] = useState(false);
  const [caller, setcaller] = useState('');
  const [callerSignal, setcallerSignal] = useState();
  const [callAccepted, setcallAccepted] = useState(false);
  const [idToCall, setidToCall] = useState('');
  const [callEnded, setEnded] = useState(false);
  const [name, setname] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on('me', (id) => {
      setMe(id);
    });

    socket.on('callUser', (data) => {
      setreceivingCall(true);
      setcaller(data.from);
      setname(data.name);
      setcallerSignal(data.callerSignal);
    });
  }, []);
  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on('callAccepted', (signal) => {
      setcallAccepted(true);
      peer.signal(signal);
      connectionRef.current = peer;
    });

    const answerCall = () => {
      setcallAccepted(true);
      const peer = new Peer({
        initiator: false,
        trickler: false,
        stream: stream,
      });
    };

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setEnded(true);
    connectionRef.current.destroy();
  };

  return <div className="App">
    <h1 style={{textAlign:"center", color:"#fff"}}>ZoomSalo</h1>
    <div className="container">
      <div className="video-container">
  <div className="video">
    {stream && }
  </div>
      </div>
    </div>
  </div>;
}

export default App;
