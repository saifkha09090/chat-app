"use client"

import { useState } from "react"
import Sidebar from "../chat/sidebar/Sidebar"
import Messages from "../chat/messages/Messages"

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  return (
    <div className="h-screen flex">
      <Sidebar setSelectedUser={setSelectedUser} setConversationId={setConversationId}  />
      <Messages selectedUser={selectedUser} conversationId={conversationId} setSelectedUser={setSelectedUser} setConversationId={setConversationId} />
    </div>
  )
}

export default Dashboard