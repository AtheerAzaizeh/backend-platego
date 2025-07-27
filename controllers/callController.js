const User = require("../models/user")

// Store active calls in memory (in production, use Redis)
const activeCalls = new Map()

exports.handleCallSignaling = (io, socket) => {
  // User joins their personal room
  socket.on("joinUser", (userId) => {
    socket.join(`user_${userId}`)
    socket.userId = userId
    console.log(`User ${userId} joined their room`)
  })

  // Initiate call
  socket.on("initiateCall", async (data) => {
    try {
      const { callId, targetUserId, callerName, carPlate } = data
      const callerId = socket.userId

      // Store call info
      activeCalls.set(callId, {
        callerId,
        targetUserId,
        status: "ringing",
        startTime: Date.now(),
      })

      // Send call to target user
      io.to(`user_${targetUserId}`).emit("incomingCall", {
        callId,
        callerId,
        callerName,
        carPlate,
      })

      console.log(`Call initiated: ${callerId} -> ${targetUserId}`)
    } catch (error) {
      console.error("Error initiating call:", error)
    }
  })

  // Accept call
  socket.on("acceptCall", (data) => {
    const { callId, targetUserId } = data
    const call = activeCalls.get(callId)

    if (call) {
      call.status = "accepted"

      // Notify caller that call was accepted
      io.to(`user_${targetUserId}`).emit("callAccepted", { callId })

      console.log(`Call accepted: ${callId}`)
    }
  })

  // Reject call
  socket.on("rejectCall", (data) => {
    const { callId, targetUserId } = data

    // Notify caller that call was rejected
    io.to(`user_${targetUserId}`).emit("callRejected", { callId })

    // Remove call from active calls
    activeCalls.delete(callId)

    console.log(`Call rejected: ${callId}`)
  })

  // End call
  socket.on("endCall", (data) => {
    const { callId, targetUserId } = data

    // Notify other user that call ended
    if (targetUserId) {
      io.to(`user_${targetUserId}`).emit("callEnded", { callId })
    }

    // Remove call from active calls
    activeCalls.delete(callId)

    console.log(`Call ended: ${callId}`)
  })

  // WebRTC Signaling
  socket.on("webrtc-offer", (data) => {
    const { callId, targetUserId, offer } = data
    io.to(`user_${targetUserId}`).emit("webrtc-offer", {
      callId,
      offer,
      senderId: socket.userId,
    })
  })

  socket.on("webrtc-answer", (data) => {
    const { callId, targetUserId, answer } = data
    io.to(`user_${targetUserId}`).emit("webrtc-answer", {
      callId,
      answer,
      senderId: socket.userId,
    })
  })

  socket.on("webrtc-ice-candidate", (data) => {
    const { callId, targetUserId, candidate } = data
    io.to(`user_${targetUserId}`).emit("webrtc-ice-candidate", {
      callId,
      candidate,
      senderId: socket.userId,
    })
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    // End any active calls for this user
    for (const [callId, call] of activeCalls.entries()) {
      if (call.callerId === socket.userId || call.targetUserId === socket.userId) {
        const otherUserId = call.callerId === socket.userId ? call.targetUserId : call.callerId
        io.to(`user_${otherUserId}`).emit("callEnded", { callId })
        activeCalls.delete(callId)
      }
    }

    console.log(`User ${socket.userId} disconnected`)
  })
}

// Get active calls (for debugging/monitoring)
exports.getActiveCalls = (req, res) => {
  const calls = Array.from(activeCalls.entries()).map(([callId, call]) => ({
    callId,
    ...call,
  }))

  res.json({ activeCalls: calls })
}
