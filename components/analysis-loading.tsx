"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface AnalysisLoadingProps {
  headers?: string[]
}

export default function AnalysisLoading({ headers }: AnalysisLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState("Initializing analysis")
  const [showingCorrelations, setShowingCorrelations] = useState(false)

  const stages = [
    "Initializing analysis",
    "Scanning data structure",
    "Identifying patterns",
    "Detecting business rules",
    "Analyzing field correlations",
    "Mapping to standards",
    "Finding outliers",
    "Generating insights",
  ]

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 0.5
      })
    }, 100)

    // Simulate changing stages
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        const currentIndex = stages.indexOf(prev)
        const nextIndex = (currentIndex + 1) % stages.length

        // When we reach the correlation analysis stage, show correlation visualization
        if (stages[nextIndex] === "Analyzing field correlations") {
          setShowingCorrelations(true)
        } else if (stages[nextIndex] === "Mapping to standards") {
          setShowingCorrelations(false)
        }

        return stages[nextIndex]
      })
    }, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(stageInterval)
    }
  }, [])

  // Use provided headers or fallback to mock headers
  const displayHeaders = headers || [
    "Customer ID",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Registration Date",
    "Customer Segment",
  ]

  // Randomly select one header to be an outlier
  const outlierIndex = headers ? Math.floor(Math.random() * headers.length) : 4

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">AI is analyzing your data</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our AI is working to understand patterns and relationships in your data
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{currentStage}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="relative h-64 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
            <div className="absolute inset-0">
              {showingCorrelations ? (
                <CorrelationAnimation headers={displayHeaders} outlierIndex={outlierIndex} />
              ) : (
                <DataFlowAnimation progress={progress} headers={displayHeaders} outlierIndex={outlierIndex} />
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Animation showing correlations between fields
function CorrelationAnimation({
  headers,
  outlierIndex,
}: {
  headers: string[]
  outlierIndex: number
}) {
  // Generate some random correlations for visualization
  const correlations = generateRandomCorrelations(headers, 3)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-full h-full">
        <svg className="w-full h-full">
          {correlations.map((corr, index) => {
            const sourceIndex = headers.indexOf(corr.source)
            const targetIndex = headers.indexOf(corr.target)

            // Calculate positions
            const sourceX = 100 + sourceIndex * 150
            const sourceY = 80
            const targetX = 100 + targetIndex * 150
            const targetY = 180

            return (
              <g key={index}>
                <motion.path
                  d={`M ${sourceX} ${sourceY} C ${sourceX} ${(sourceY + targetY) / 2}, ${targetX} ${(sourceY + targetY) / 2}, ${targetX} ${targetY}`}
                  stroke={corr.color}
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 1.5, delay: index * 0.5 }}
                />
                <motion.circle
                  cx={sourceX}
                  cy={sourceY}
                  r="5"
                  fill={corr.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.5 }}
                />
                <motion.circle
                  cx={targetX}
                  cy={targetY}
                  r="5"
                  fill={corr.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.5 + 1 }}
                />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="absolute top-20 left-0 right-0">
        <div className="flex justify-center space-x-8 overflow-x-auto px-4">
          {headers.slice(0, 5).map((header, index) => (
            <motion.div
              key={`source-${index}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                index === outlierIndex
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
            >
              {header}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute top-48 left-0 right-0">
        <div className="flex justify-center space-x-8 overflow-x-auto px-4">
          {headers.slice(0, 5).map((header, index) => (
            <motion.div
              key={`target-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index + 0.5 }}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              {header}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Correlation descriptions */}
      <div className="absolute bottom-4 left-0 right-0">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-2 text-xs max-w-xs text-center"
          >
            Discovering relationships between fields...
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate random correlations for visualization
function generateRandomCorrelations(
  headers: string[],
  count: number,
): Array<{ source: string; target: string; color: string }> {
  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]
  const result = []

  // Ensure we don't try to generate more correlations than possible
  const maxPossible = Math.min(count, Math.floor(headers.length / 2))

  for (let i = 0; i < maxPossible; i++) {
    // Pick random source and target that aren't the same
    const sourceIndex = Math.floor(Math.random() * headers.length)
    let targetIndex

    do {
      targetIndex = Math.floor(Math.random() * headers.length)
    } while (targetIndex === sourceIndex)

    result.push({
      source: headers[sourceIndex],
      target: headers[targetIndex],
      color: colors[i % colors.length],
    })
  }

  return result
}

// Update the DataFlowAnimation component to better visualize the file headers
function DataFlowAnimation({
  progress,
  headers,
  outlierIndex,
}: {
  progress: number
  headers: string[]
  outlierIndex: number
}) {
  // Generate random particles based on progress
  const particleCount = Math.floor((progress / 100) * 50) + 5

  // Calculate how many headers to show based on progress
  const headersToShow = Math.ceil((progress / 100) * headers.length)

  return (
    <div className="relative w-full h-full">
      {/* Particles animation */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 opacity-70"
          initial={{
            x: Math.random() * 100 + "%",
            y: "0%",
            opacity: 0.3 + Math.random() * 0.7,
          }}
          animate={{
            x: Math.random() * 100 + "%",
            y: "100%",
            opacity: 0,
          }}
          transition={{
            duration: 1 + Math.random() * 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "linear",
            delay: Math.random() * 2,
          }}
          style={{
            backgroundColor: i % 5 === 0 ? "#ef4444" : "#3b82f6",
          }}
        />
      ))}

      {/* Header visualization */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className="flex space-x-1 overflow-hidden max-w-full">
          {headers.slice(0, headersToShow).map((header, index) => (
            <motion.div
              key={`header-${index}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                index === outlierIndex
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-2 ring-red-500/50"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
            >
              {header}
              {index === outlierIndex && (
                <motion.span
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Field nodes with connections */}
      {progress > 30 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1/2">
          <svg className="w-full h-full absolute top-0 left-0" style={{ zIndex: 0 }}>
            {headers.slice(0, headersToShow).map((_, index) => {
              if (index < headersToShow - 1) {
                return (
                  <motion.line
                    key={`line-${index}`}
                    x1={`${(index / (headersToShow - 1)) * 80 + 10}%`}
                    y1="20%"
                    x2={`${((index + 1) / (headersToShow - 1)) * 80 + 10}%`}
                    y2="20%"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                )
              }
              return null
            })}
          </svg>

          {headers.slice(0, headersToShow).map((header, index) => (
            <motion.div
              key={`node-${index}`}
              className={`absolute px-3 py-1.5 rounded-full text-xs font-medium ${
                index === outlierIndex
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-2 ring-red-500/50"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
              style={{
                top: "20%",
                left: `${(index / (headers.length - 1)) * 80 + 10}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              {header}
              {index === outlierIndex && (
                <motion.span
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
