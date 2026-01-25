"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, RotateCcw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DocumentContent, TemplateConfig, Features, Sections } from "@/lib/types/document"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  documentContent: DocumentContent
  templateConfig: TemplateConfig
  features: Features
  sections: Sections
  onTemplateChange?: (updatedContent: DocumentContent, updatedFeatures: Features, updatedSections: Sections) => void
  onRepublish?: (updatedContent: DocumentContent, updatedFeatures: Features, updatedSections: Sections) => void
  onDiscard?: () => void
}

export function AIChatbot({
  documentContent: initialContent,
  templateConfig,
  features: initialFeatures,
  sections: initialSections,
  onTemplateChange,
  onRepublish,
  onDiscard,
}: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you modify this template or answer questions about it. What would you like to do?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [currentContent, setCurrentContent] = useState(initialContent)
  const [currentFeatures, setCurrentFeatures] = useState(initialFeatures)
  const [currentSections, setCurrentSections] = useState(initialSections)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          messages: messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })), // Exclude the just-added user message
          documentContent: currentContent,
          templateConfig,
          features: currentFeatures,
          sections: currentSections,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        // If the AI made changes to the template
        if (data.updatedContent || data.updatedFeatures || data.updatedSections) {
          const updatedContent = data.updatedContent || currentContent
          const updatedFeatures = data.updatedFeatures || currentFeatures
          const updatedSections = data.updatedSections || currentSections

          setCurrentContent(updatedContent)
          setCurrentFeatures(updatedFeatures)
          setCurrentSections(updatedSections)
          setHasChanges(true)

          // Notify parent component of changes
          if (onTemplateChange) {
            onTemplateChange(updatedContent, updatedFeatures, updatedSections)
          }
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${data.error || "Unknown error"}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepublish = () => {
    if (onRepublish) {
      onRepublish(currentContent, currentFeatures, currentSections)
      setHasChanges(false)
    }
  }

  const handleDiscard = () => {
    setCurrentContent(initialContent)
    setCurrentFeatures(initialFeatures)
    setCurrentSections(initialSections)
    setHasChanges(false)
    if (onDiscard) {
      onDiscard()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#628F07] text-white shadow-lg hover:bg-[#628F07]/90 transition-all hover:scale-110 flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] flex flex-col">
          <Card className="flex flex-col h-full shadow-2xl border-2 border-[#628F07]/20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-[#628F07] text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-[#628F07] text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#628F07]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Action Buttons (when there are changes) */}
            {hasChanges && (
              <div className="p-3 border-t bg-yellow-50 flex gap-2">
                <Button
                  size="sm"
                  onClick={handleRepublish}
                  className="flex-1 bg-[#628F07] hover:bg-[#628F07]/90 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Republish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDiscard}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Discard
                </Button>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything or request changes..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#628F07] hover:bg-[#628F07]/90"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
