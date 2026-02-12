"use client";
import { useEffect, useRef, useState } from "react";
// import SimplePeer from "simple-peer"; // We will lazy load or use raw WebRTC
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from "lucide-react";

// Helper to get SimplePeer safely in Next.js
// We use raw WebRTC for maximum control and zero-delay tuning if SimplePeer fails, 
// but SimplePeer is easier. Let's try raw RTCPeerConnection for better "zero delay" control directly?
// No, SimplePeer is standard. I'll stick to it but import differently.

export default function CallManager() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { outgoingCallData, setOutgoingCallData } = useCall();
  
  const [incomingCall, setIncomingCall] = useState<{ from: string; name: string; signal: any } | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);

  // Sound effects
  const ringSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ringSound.current = new Audio("https://pixabay.com/sound-effects/download/phone-calling-1-16327.mp3??"); 
    // Just a placeholder URL, handled simpler in UI
  }, []);

  // Handle Socket Events for Incoming Calls
  useEffect(() => {
    if (!socket) return;

    socket.on("call-made", (data) => {
      console.log("Incoming call from", data.name);
      setIncomingCall({ from: data.from, name: data.name, signal: data.signal });
      // Play ringtone?
    });

    return () => {
      socket.off("call-made");
    };
  }, [socket]);

  // Handle Outgoing Call Trigger
  useEffect(() => {
    if (outgoingCallData && !callAccepted) {
      startCall(outgoingCallData.userId, outgoingCallData.userName);
    }
  }, [outgoingCallData]);

  const startCall = async (idToCall: string, nameToCall: string) => {
    // 1. Get Media
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      // 2. Create Peer
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      connectionRef.current = peer;

      // Add tracks
      currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

      // Handle ICE
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          // Send candidate (we use signal-received generic channel or piggyback?)
          // For raw WebRTC, we need full signaling. 
          // Simplified: Just use 'send-signal' for everything.
          socket?.emit("send-signal", { to: idToCall, signal: { candidate: event.candidate }, from: user?._id });
        }
      };

      // Handle incoming stream
      peer.ontrack = (event) => {
        if (userVideo.current) userVideo.current.srcObject = event.streams[0];
      };

      // Create Offer
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // Emit Call
      socket?.emit("call-user", {
        userToCall: idToCall,
        signalData: { sdp: offer }, // Wrap nicely
        from: user?._id,
        name: user?.name
      });

      // Listen for Answer
      socket?.on("call-answered", async (data) => {
        if (data.signal.sdp) {
          await peer.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
          setCallAccepted(true);
        }
      });

      // Listen for ICE from other side
      socket?.on("signal-received", async (data) => {
        if (data.signal.candidate) {
           await peer.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
        }
      });

    } catch (err) {
      console.error("Failed to start call", err);
      endCall();
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    
    setCallAccepted(true);

    try {
       const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
       setStream(currentStream);
       if (myVideo.current) myVideo.current.srcObject = currentStream;

       const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      connectionRef.current = peer;

      currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
           socket?.emit("send-signal", { to: incomingCall.from, signal: { candidate: event.candidate }, from: user?._id });
        }
      };

      peer.ontrack = (event) => {
        if (userVideo.current) userVideo.current.srcObject = event.streams[0];
      };

      // Set Remote from incoming
      if (incomingCall.signal.sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.signal.sdp));
      }

      // Create Answer
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      // Emit Answer
      socket?.emit("answer-call", {
        signal: { sdp: answer },
        to: incomingCall.from,
        from: user?._id
      });
      
      // Listen for Candidates from caller
      socket?.on("signal-received", async (data) => {
         if (data.signal.candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
         }
      });

    } catch (err) {
      console.log(err);
      endCall();
    }
  };

  const endCall = () => {
    setCallEnded(true);
    connectionRef.current?.close();
    setIncomingCall(null);
    setOutgoingCallData(null);
    setCallAccepted(false);
    stream?.getTracks().forEach(t => t.stop());
    window.location.reload(); // Simplest cleanup for WebRTC state
  };

  // UI RENDER
  if (!incomingCall && !outgoingCallData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 w-full max-w-4xl flex flex-col items-center overflow-hidden relative">
        
        {/* Connection Status */}
        {!callAccepted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
             <div className="w-24 h-24 bg-zinc-800 rounded-full animate-pulse mb-6 flex items-center justify-center">
                <Phone size={40} className="text-zinc-400" />
             </div>
             {incomingCall ? (
                <>
                  <h3 className="text-2xl text-white mb-2">{incomingCall.name} is calling...</h3>
                  <div className="flex gap-4 mt-8">
                     <button onClick={endCall} className="bg-red-500 hover:bg-red-600 p-4 rounded-full transition-all">
                       <PhoneOff className="text-white" size={32} />
                     </button>
                     <button onClick={answerCall} className="bg-green-500 hover:bg-green-600 p-4 rounded-full transition-all animate-bounce">
                       <Phone className="text-white" size={32} />
                     </button>
                  </div>
                </>
             ) : (
                <>
                  <h3 className="text-2xl text-white mb-2">Calling {outgoingCallData?.userName}...</h3>
                  <button onClick={endCall} className="bg-red-500 hover:bg-red-600 p-4 rounded-full mt-8">
                      <PhoneOff className="text-white" size={32} />
                  </button>
                </>
             )}
          </div>
        )}

        {/* Video Grid */}
        <div className={`grid ${callAccepted ? 'grid-cols-2' : 'hidden'} gap-4 w-full h-[500px]`}>
            {/* My Video */}
            <div className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                <span className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white">You</span>
            </div>
             {/* User Video */}
            <div className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
               {callAccepted && <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />}
               <span className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white">
                  {incomingCall?.name || outgoingCallData?.userName}
               </span>
            </div>
        </div>

        {/* Controls */}
        {callAccepted && (
            <div className="flex items-center gap-4 mt-6">
                <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-full ${!isMicOn ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {isMicOn ? <Mic /> : <MicOff />}
                </button>
                <button onClick={endCall} className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600">
                    <PhoneOff size={24} />
                </button>
                <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-4 rounded-full ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {isVideoOn ? <Video /> : <VideoOff />}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
