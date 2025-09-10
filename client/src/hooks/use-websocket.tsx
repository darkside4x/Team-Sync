import { useEffect, useRef, useState } from "react";
import type { Message } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  teamId?: string;
  userId?: string;
  content?: string;
  message?: Message;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };
    
    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.type === 'chat_message' && data.message) {
          setMessages(prev => [data.message!, ...prev]);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };
    
    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };
    
    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (teamId: string, userId: string, content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'chat_message',
        teamId,
        userId,
        content
      }));
    }
  };

  return {
    isConnected,
    messages,
    sendMessage,
    setMessages
  };
}
