/**
 * MCP (Model Context Protocol) Server API Route
 * 
 * This route handles MCP server requests with API token authentication.
 * It provides a standardized interface for AI model interactions.
 */

import { createAPIFileRoute } from '@tanstack/react-start/api'
import { Anthropic } from '@anthropic-ai/sdk'
import { getMCPConfig, validateMCPToken } from '../../../mcp.config'

export const APIRoute = createAPIFileRoute('/api/mcp')({
  GET: async ({ request }) => {
    const config = getMCPConfig()

    // Check if MCP server is enabled
    if (!config.enabled) {
      return new Response(
        JSON.stringify({ 
          error: 'MCP server is not enabled',
          message: 'Set VITE_MCP_SERVER_ENABLED=true in your environment variables to enable MCP server'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract API token from request headers
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Validate API token
    if (!token || !validateMCPToken(config.apiToken, token)) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Invalid or missing API token. Please provide a valid Bearer token in the Authorization header.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const messagesParam = url.searchParams.get('messages')
    const systemPromptParam = url.searchParams.get('systemPrompt')

    if (!messagesParam) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'Missing required parameter: messages'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    try {
      const messages = JSON.parse(messagesParam)
      const systemPrompt = systemPromptParam ? JSON.parse(systemPromptParam) : undefined

      // Get Anthropic API key
      const apiKey = process.env.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY

      if (!apiKey) {
        return new Response(
          JSON.stringify({ 
            error: 'Configuration Error',
            message: 'Missing Anthropic API key. Please set VITE_ANTHROPIC_API_KEY in your environment variables.'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Create Anthropic client
      const anthropic = new Anthropic({
        apiKey,
        timeout: config.timeout,
      })

      // Filter and format messages
      const formattedMessages = messages
        .filter((msg: any) => msg.content.trim() !== '')
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content.trim(),
        }))

      if (formattedMessages.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Bad Request',
            message: 'No valid messages to process'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Stream response from Anthropic
      const response = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt || 'You are a helpful AI assistant.',
        messages: formattedMessages,
      })

      return new Response(response.toReadableStream(), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      console.error('Error in MCP API:', error)
      
      let errorMessage = 'Failed to process MCP request'
      let statusCode = 500
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.'
          statusCode = 429
        } else if (error.message.includes('Connection error') || error.name === 'APIConnectionError') {
          errorMessage = 'Connection to Anthropic API failed. Please check your internet connection.'
          statusCode = 503
        } else if (error.message.includes('authentication')) {
          errorMessage = 'Authentication failed. Please check your Anthropic API key.'
          statusCode = 401
        } else {
          errorMessage = error.message
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: error instanceof Error ? error.name : undefined
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  },

  POST: async ({ request }) => {
    const config = getMCPConfig()

    // Check if MCP server is enabled
    if (!config.enabled) {
      return new Response(
        JSON.stringify({ 
          error: 'MCP server is not enabled',
          message: 'Set VITE_MCP_SERVER_ENABLED=true in your environment variables to enable MCP server'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract API token from request headers
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Validate API token
    if (!token || !validateMCPToken(config.apiToken, token)) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Invalid or missing API token. Please provide a valid Bearer token in the Authorization header.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    try {
      const body = await request.json()
      const { messages, systemPrompt } = body

      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ 
            error: 'Bad Request',
            message: 'Missing or invalid messages array in request body'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Get Anthropic API key
      const apiKey = process.env.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY

      if (!apiKey) {
        return new Response(
          JSON.stringify({ 
            error: 'Configuration Error',
            message: 'Missing Anthropic API key. Please set VITE_ANTHROPIC_API_KEY in your environment variables.'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Create Anthropic client
      const anthropic = new Anthropic({
        apiKey,
        timeout: config.timeout,
      })

      // Filter and format messages
      const formattedMessages = messages
        .filter((msg: any) => msg.content.trim() !== '')
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content.trim(),
        }))

      if (formattedMessages.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Bad Request',
            message: 'No valid messages to process'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Stream response from Anthropic
      const response = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt || 'You are a helpful AI assistant.',
        messages: formattedMessages,
      })

      return new Response(response.toReadableStream(), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      console.error('Error in MCP API:', error)
      
      let errorMessage = 'Failed to process MCP request'
      let statusCode = 500
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.'
          statusCode = 429
        } else if (error.message.includes('Connection error') || error.name === 'APIConnectionError') {
          errorMessage = 'Connection to Anthropic API failed. Please check your internet connection.'
          statusCode = 503
        } else if (error.message.includes('authentication')) {
          errorMessage = 'Authentication failed. Please check your Anthropic API key.'
          statusCode = 401
        } else {
          errorMessage = error.message
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: error instanceof Error ? error.name : undefined
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  },
})
