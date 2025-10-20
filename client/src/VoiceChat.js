// src/VoiceChat.jsx
import React, { useEffect, useRef, useState } from "react";

export default function VoiceChat({ userEmail, sessionId }) {
  const [connected, setConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioQueueRef = useRef([]); // for playing chunks
  const audioElRef = useRef(null);

  useEffect(() => {
    // create WS connection to server realtime proxy
    const url = (window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/realtime";
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("VoiceChat: websocket open");
      setConnected(true);
      // optionally send an 'init' event with metadata
      ws.send(JSON.stringify({ type: "session.init", user: userEmail, session_id: sessionId }));
    };

    ws.onmessage = (evt) => {
      // Realtime OpenAI messages are JSON; some messages will contain audio chunks base64
      try {
        const data = JSON.parse(evt.data);
        // Example: data.type === "output_audio_buffer.append" or "output_audio.chunk"
        if (data.type === "output_audio_chunk" && data.audio) {
          // receive base64 audio from OpenAI and play it
          playBase64Audio(data.audio);
        } else {
          // handle other messages / model transcripts, etc
          console.log("RT message:", data);
        }
      } catch (err) {
        // If it's binary, you could handle it here
        console.error("VoiceChat: could not parse message", err);
      }
    };

    ws.onclose = () => {
      console.log("VoiceChat: websocket closed");
      setConnected(false);
    };

    ws.onerror = (e) => {
      console.error("VoiceChat WS error", e);
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [userEmail, sessionId]);

  // Play base64 audio (assumes audio/webm or audio/mp3 based on server/model)
  function playBase64Audio(base64) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/webm;codecs=opus" }); // try webm/opus; change if your model emits different
    const url = URL.createObjectURL(blob);
    const a = new Audio(url);
    a.play().catch((err) => console.error("Play error", err));
  }

  async function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone not supported in this browser");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Use MediaRecorder; many browsers produce webm/opus format
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const mr = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 64000 });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = async (ev) => {
      if (ev.data && ev.data.size > 0) {
        // convert blob to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          // send to server as an input audio append event
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: "input_audio_buffer.append",
              audio: base64
            }));
          }
        };
        reader.readAsDataURL(ev.data);
      }
    };

    mr.onstart = () => {
      setSpeaking(true);
      console.log("Recording started");
    };
    mr.onstop = () => {
      setSpeaking(false);
      console.log("Recording stopped");
      // tell model we've finished sending audio buffer and request a response
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "input_audio_buffer.flush" }));
        // request the model to create a response (voice)
        wsRef.current.send(JSON.stringify({
          type: "response.create",
          response: {
            instructions: "You are a friendly, calm therapy assistant. Reply succinctly and kindly.",
            modalities: ["text","audio"], // ask for audio output as well as text
            audio: { voice: "alloy", format: "webm" } // depends on model support
          }
        }));
      }
    };

    // Start and record in small chunks
    mr.start(250); // timeslice 250ms -> ondataavailable fires every 250ms
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // stop tracks
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>Voice Session</h3>
      <p>Realtime status: {connected ? "connected" : "disconnected"}</p>
      <button onClick={startRecording} disabled={!connected || speaking}>Start talking</button>
      <button onClick={stopRecording} disabled={!speaking}>Stop</button>
      <div>
        <small>When you stop, the model will generate and speak its response.</small>
      </div>
    </div>
  );
}
