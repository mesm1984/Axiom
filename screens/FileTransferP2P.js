import React, { useRef, useState, useEffect } from 'react';
import { View, Button, Text, Platform, ProgressBarAndroid, ProgressViewIOS } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { RTCPeerConnection } from 'react-native-webrtc';
import io from 'socket.io-client';
import RNFS from 'react-native-fs';

const styles = {
  container: {
    padding: 20,
  },
};

const SIGNALING_SERVER_URL = 'ws://10.0.2.2:3000';
const socket = io(SIGNALING_SERVER_URL);
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function FileTransferP2P() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const peerConnection = useRef();
  const dataChannel = useRef(null);
  const sentChunks = useRef({});
  const sentTotal = useRef(0);

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };

    peerConnection.current.ondatachannel = (event) => {
      dataChannel.current = event.channel;
      dataChannel.current.onmessage = handleReceiveMessage;
    };

    socket.on('offer', async (offer) => {
      await peerConnection.current.setRemoteDescription(offer);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', async (answer) => {
      await peerConnection.current.setRemoteDescription(answer);
    });

    socket.on('ice-candidate', async (candidate) => {
      if (candidate) await peerConnection.current.addIceCandidate(candidate);
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      peerConnection.current && peerConnection.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createDataChannel = () => {
    dataChannel.current = peerConnection.current.createDataChannel('file');
    dataChannel.current.onmessage = handleReceiveMessage;
  };

  const sendFile = async () => {
    try {
      createDataChannel();
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('offer', offer);

      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.allFiles] });
      const fileReader = new FileReader();
      const chunkSize = 16 * 1024;
      let offset = 0;

      fileReader.onload = (e) => {
        const buffer = e.target.result;
        let chunkIndex = 0;
        sentChunks.current = {}; // Reset
        while (offset < buffer.byteLength) {
          const chunk = buffer.slice(offset, offset + chunkSize);
          const chunkData = Array.from(new Uint8Array(chunk));
          dataChannel.current.send(JSON.stringify({ type: 'chunk', index: chunkIndex, data: chunkData }));
          sentChunks.current[chunkIndex] = chunkData;
          offset += chunkSize;
          chunkIndex++;
          setProgress(offset / buffer.byteLength);
        }
        sentTotal.current = chunkIndex;
        dataChannel.current.send(JSON.stringify({ type: 'eof', total: chunkIndex }));
        setStatus('Fichier envoyé !');
      };
      fileReader.readAsArrayBuffer(res);
    } catch (err) {
      setStatus('Erreur lors de la sélection du fichier');
    }
  };

  let expectedChunks = null;
  let receivedChunks = {};

  async function handleReceiveMessage(event) {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    if (msg.type === 'chunk') {
      receivedChunks[msg.index] = msg.data;
    } else if (msg.type === 'eof') {
      expectedChunks = msg.total;
      if (Object.keys(receivedChunks).length === expectedChunks) {
        const allData = [];
        for (let i = 0; i < expectedChunks; i++) {
          allData.push(...receivedChunks[i]);
        }
        const arrayBuffer = new Uint8Array(allData).buffer;
        const filePath = RNFS.DownloadDirectoryPath + '/fichier_recu_' + Date.now();
        function arrayBufferToBase64(buffer) {
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return global.btoa(binary);
        }
        try {
          const base64Data = arrayBufferToBase64(arrayBuffer);
          await RNFS.writeFile(filePath, base64Data, 'base64');
          setStatus('Fichier reçu et sauvegardé : ' + filePath);
        } catch (e) {
          setStatus('Erreur lors de la sauvegarde du fichier');
        }
        receivedChunks = {};
      } else {
        const missing = [];
        for (let i = 0; i < expectedChunks; i++) {
          if (!receivedChunks[i]) missing.push(i);
        }
        dataChannel.current.send(JSON.stringify({ type: 'resume-request', missing }));
        setStatus('Reprise demandée pour chunks : ' + missing.join(','));
      }
    } else if (msg.type === 'resume-request') {
      if (sentChunks.current && msg.missing) {
        msg.missing.forEach((missedIndex) => {
          if (sentChunks.current[missedIndex]) {
            dataChannel.current.send(
              JSON.stringify({ type: 'chunk', index: missedIndex, data: sentChunks.current[missedIndex] })
            );
          }
        });
        dataChannel.current.send(
          JSON.stringify({ type: 'eof', total: sentTotal.current })
        );
        setStatus('Chunks manquants renvoyés');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Envoyer un fichier" onPress={sendFile} />
      {Platform.OS === 'android' ? (
        <ProgressBarAndroid progress={progress} styleAttr="Horizontal" />
      ) : (
        <ProgressViewIOS progress={progress} />
      )}
      <Text>{status}</Text>
    </View>
  );
}
