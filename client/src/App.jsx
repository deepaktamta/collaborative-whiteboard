import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Trash2, Users } from 'lucide-react';

// Connect to your Node server
const socket = io.connect("http://localhost:5000");

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    if (joined && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const context = canvas.getContext("2d");
      context.scale(2, 2);
      context.lineCap = "round";
      context.strokeStyle = color;
      context.lineWidth = 5;
      contextRef.current = context;

      // Listen for drawing from others
      socket.on("drawing", (data) => {
        draw(data.x1, data.y1, data.x2, data.y2, data.color, false);
      });

      socket.on("clear_canvas", () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
      });
    }
  }, [joined]); // Only run this once we join the room

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  const draw = (x1, y1, x2, y2, strokeColor, shouldEmit) => {
    if (!contextRef.current) return; // Prevention: Don't draw if context isn't ready
    
    contextRef.current.strokeStyle = strokeColor;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x1, y1);
    contextRef.current.lineTo(x2, y2);
    contextRef.current.stroke();
    contextRef.current.closePath();

    if (shouldEmit) {
      socket.emit("drawing", { x1, y1, x2, y2, color: strokeColor, room });
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    if (contextRef.current) {
      contextRef.current.lastX = offsetX;
      contextRef.current.lastY = offsetY;
      setIsDrawing(true);
    }
  };

  const drawing = ({ nativeEvent }) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    
    draw(contextRef.current.lastX, contextRef.current.lastY, offsetX, offsetY, color, true);
    
    contextRef.current.lastX = offsetX;
    contextRef.current.lastY = offsetY;
  };

  const clearCanvas = () => {
    if (contextRef.current) {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit("clear_canvas", room);
    }
  };

  // If not joined, show Login Screen
  if (!joined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Join Whiteboard Room</h2>
          <input 
            style={{ border: '1px solid #ccc', padding: '0.5rem', borderRadius: '4px', width: '100%', marginBottom: '1rem' }} 
            placeholder="Room ID (e.g. 123)" 
            onChange={(e) => setRoom(e.target.value)}
          />
          <button 
            onClick={joinRoom} 
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', width: '100%', cursor: 'pointer', border: 'none' }}
          >
            Join
          </button>
        </div>
      </div>
    );
  }
 
  const downloadImage = () => {
  const canvas = canvasRef.current;
  const link = document.createElement("a");
  link.download = "whiteboard-export.png";
  link.href = canvas.toDataURL();
  link.click();
};
  // If joined, show Canvas
  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '15px', background: 'white', padding: '10px 20px', borderRadius: '50px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={clearCanvas} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Clear</button>
        <button onClick={downloadImage} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Download</button>
        <span style={{ borderLeft: '1px solid #ddd', paddingLeft: '10px' }}>Room: {room}</span>
      </div>

      <canvas
        onMouseDown={startDrawing}
        onMouseUp={() => setIsDrawing(false)}
        onMouseMove={drawing}
        ref={canvasRef}
        style={{ cursor: 'crosshair' }}
      />
    </div>
  );
}

export default App;