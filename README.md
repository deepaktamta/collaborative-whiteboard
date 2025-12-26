# Real-Time Collaborative Whiteboard

A full-stack, multi-room collaborative whiteboard application built with **React**, **Node.js**, and **Socket.io**. This project allows multiple users to draw on a shared canvas in real-time.

## 🚀 Features
* **Real-Time Sync:** Instant drawing synchronization across all clients using WebSockets.
* **Multi-Room Support:** Users can join specific Room IDs to collaborate in private sessions.
* **Canvas Tools:** Change brush colors and clear the canvas for everyone in the room.
* **High Performance:** Uses HTML5 Canvas API for smooth, lag-free drawing.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons.
* **Backend:** Node.js, Express.js.
* **Real-Time Engine:** Socket.io (WebSockets).

## 📋 System Architecture
The application follows a Client-Server architecture where the Node.js server acts as a message broker. When a user draws, the coordinates are emitted via WebSockets and broadcasted to other clients subscribed to the same Room ID.



## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repository-link>
cd WHITEBOARD