"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Issue, Edge } from "@/lib/mock-data"

interface Node {
  id: string
  x: number
  y: number
  radius: number
  issue: Issue
  isDragging: boolean
  vx: number
  vy: number
}

interface OrganicClusterProps {
  issues: Issue[]
  edges: Edge[]
}

export function OrganicCluster({ issues, edges }: OrganicClusterProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [tooltip, setTooltip] = useState<{ x: number; y: number; issue: Issue } | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const animationRef = useRef<number>()

  // Initialize nodes
  useEffect(() => {
    if (issues.length === 0) return

    const width = 800
    const height = 600
    const centerX = width / 2
    const centerY = height / 2

    const initialNodes: Node[] = issues.map((issue, index) => {
      const angle = (index / issues.length) * 2 * Math.PI
      const distance = 150 + Math.random() * 100
      const radius = Math.max(20, Math.min(50, 15 + issue.likes * 2))

      return {
        id: issue.id,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius,
        issue,
        isDragging: false,
        vx: 0,
        vy: 0,
      }
    })

    setNodes(initialNodes)
  }, [issues])

  // Physics simulation
  const updatePhysics = useCallback(() => {
    setNodes((prevNodes) => {
      const newNodes = prevNodes.map((node) => {
        if (node.isDragging) return node

        let fx = 0
        let fy = 0

        // Repulsion from other nodes
        prevNodes.forEach((other) => {
          if (other.id === node.id) return
          const dx = node.x - other.x
          const dy = node.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 100) {
            const force = (100 - distance) * 0.01
            fx += (dx / distance) * force
            fy += (dy / distance) * force
          }
        })

        // Attraction to connected nodes
        edges.forEach((edge) => {
          let connectedNode: Node | undefined
          if (edge.sourceId === node.id) {
            connectedNode = prevNodes.find((n) => n.id === edge.targetId)
          } else if (edge.targetId === node.id) {
            connectedNode = prevNodes.find((n) => n.id === edge.sourceId)
          }

          if (connectedNode) {
            const dx = connectedNode.x - node.x
            const dy = connectedNode.y - node.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const targetDistance = edge.type === "cause" ? 120 : 100
            const force = (distance - targetDistance) * 0.005 * edge.confidence
            fx += (dx / distance) * force
            fy += (dy / distance) * force
          }
        })

        // Center attraction
        const centerX = 400
        const centerY = 300
        const dx = centerX - node.x
        const dy = centerY - node.y
        fx += dx * 0.001
        fy += dy * 0.001

        // Update velocity with damping
        const newVx = (node.vx + fx) * 0.9
        const newVy = (node.vy + fy) * 0.9

        // Update position
        const newX = Math.max(node.radius, Math.min(800 - node.radius, node.x + newVx))
        const newY = Math.max(node.radius, Math.min(600 - node.radius, node.y + newVy))

        return {
          ...node,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        }
      })

      return newNodes
    })
  }, [edges])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics()
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updatePhysics])

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    setDraggedNode(nodeId)
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, isDragging: true } : node)))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setNodes((prev) =>
      prev.map((node) =>
        node.id === draggedNode
          ? {
              ...node,
              x: Math.max(node.radius, Math.min(800 - node.radius, x)),
              y: Math.max(node.radius, Math.min(600 - node.radius, y)),
              vx: 0,
              vy: 0,
            }
          : node,
      ),
    )
  }

  const handleMouseUp = () => {
    if (draggedNode) {
      setNodes((prev) => prev.map((node) => (node.id === draggedNode ? { ...node, isDragging: false } : node)))
      setDraggedNode(null)
    }
  }

  const handleNodeHover = (e: React.MouseEvent, issue: Issue) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        issue,
      })
    }
  }

  const handleNodeLeave = () => {
    setTooltip(null)
  }

  if (issues.length < 2) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>マップを表示するには、2つ以上の課題が必要です。</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="800"
        height="600"
        className="border border-border rounded-lg bg-card"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Edges */}
        {edges.map((edge, index) => {
          const sourceNode = nodes.find((n) => n.id === edge.sourceId)
          const targetNode = nodes.find((n) => n.id === edge.targetId)
          if (!sourceNode || !targetNode) return null

          return (
            <line
              key={index}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#9aa3b2"
              strokeWidth={edge.confidence * 2}
              strokeDasharray={edge.type === "related" ? "5,5" : "none"}
              opacity={0.6}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill="#88e0d3"
              fillOpacity={0.7}
              stroke="#88e0d3"
              strokeWidth={2}
              className="cursor-pointer hover:fill-opacity-90 transition-all"
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onMouseEnter={(e) => handleNodeHover(e, node.issue)}
              onMouseLeave={handleNodeLeave}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-current pointer-events-none"
              fill="#0f1115"
            >
              {node.issue.likes}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 bg-popover text-popover-foreground p-3 rounded-lg border border-border shadow-lg max-w-xs"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          <h4 className="font-medium text-sm mb-1">
            {tooltip.issue.finalStatement || tooltip.issue.rawText.slice(0, 50) + "..."}
          </h4>
          <p className="text-xs text-muted-foreground mb-1">カテゴリー: {tooltip.issue.category}</p>
          <p className="text-xs text-muted-foreground">共感: {tooltip.issue.likes}</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-8 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <svg width="20" height="2">
            <line x1="0" y1="1" x2="20" y2="1" stroke="#9aa3b2" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
          <span>点線 = 関連</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg width="20" height="2">
            <line x1="0" y1="1" x2="20" y2="1" stroke="#9aa3b2" strokeWidth="2" />
          </svg>
          <span>実線 = 原因候補</span>
        </div>
      </div>
    </div>
  )
}
