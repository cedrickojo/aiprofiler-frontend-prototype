"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, Download, RefreshCw, Info, ArrowRight } from "lucide-react"

// Import the EnhancedFieldCard component
import EnhancedFieldCard from "@/components/enhanced-field-card"

interface AnalysisData {
  fileId: string
  fileName: string
  status: "complete" | "in_progress"
  progress: number
  fields: FieldData[]
  insights: string[]
  completeness: number
  correlations: CorrelationData[]
}

interface FieldData {
  name: string
  type: string
  completeness: number
  isOutlier: boolean
  standardMapping: string | null
  patterns: string[]
  sampleValues: string[]
  uniqueValues?: string[]
  valueDistribution?: Record<string, number>
}

interface CorrelationData {
  sourceField: string
  targetField: string
  correlationType: "categorical" | "numerical" | "temporal" | "conditional"
  strength: number // 0-1
  description: string
  examples: Array<{ condition: string; result: string }>
  rule?: string
}

interface AnalysisVisualizerProps {
  analysisData: AnalysisData
}

export default function AnalysisVisualizer({ analysisData }: AnalysisVisualizerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [currentData, setCurrentData] = useState(analysisData)

  // Simulate real-time updates if analysis is in progress
  useEffect(() => {
    if (analysisData.status === "in_progress") {
      const interval = setInterval(() => {
        setCurrentData((prev) => {
          const newProgress = Math.min(prev.progress + 5, 100)
          const newStatus = newProgress === 100 ? "complete" : "in_progress"

          return {
            ...prev,
            status: newStatus,
            progress: newProgress,
            completeness: Math.min(prev.completeness + 3, 100),
            fields: prev.fields.map((field) => ({
              ...field,
              completeness: Math.min(field.completeness + Math.random() * 5, 100),
            })),
          }
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [analysisData])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <RefreshCw className="h-8 w-8 text-blue-500" />
        </motion.div>
      </div>
    )
  }

  const outlierFields = currentData.fields.filter((field) => field.isOutlier)
  const mappedFields = currentData.fields.filter((field) => field.standardMapping)
  const isAnalysisComplete = currentData.progress === 100 || currentData.status === "complete"

  return (
    <div className="space-y-8">
      {/* Progress bar - changes to green when complete */}
      <Card
        className={
          isAnalysisComplete
            ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30"
            : "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30"
        }
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {isAnalysisComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              ) : (
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              )}
              <h3
                className={
                  isAnalysisComplete
                    ? "font-medium text-green-800 dark:text-green-300"
                    : "font-medium text-blue-800 dark:text-blue-300"
                }
              >
                {isAnalysisComplete ? "Analysis complete" : "Analysis in progress"}
              </h3>
            </div>
            <Badge
              variant="outline"
              className={
                isAnalysisComplete
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700"
              }
            >
              {Math.round(currentData.progress)}% Complete
            </Badge>
          </div>
          <Progress
            value={currentData.progress}
            className={isAnalysisComplete ? "h-2 bg-green-200 dark:bg-green-800" : "h-2 bg-blue-200 dark:bg-blue-800"}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fields">Field Analysis</TabsTrigger>
          <TabsTrigger value="outliers">Outliers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentData.fields.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Mapped Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mappedFields.length}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {Math.round((mappedFields.length / currentData.fields.length) * 100)}% of total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Outliers Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{outlierFields.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>File Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <FileStructureVisualizer fields={currentData.fields} />

              {/* Legend for file structure colors */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border-b-2 border-blue-500 mr-2"></div>
                  <span>Standard Field</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-b-2 border-green-500 mr-2"></div>
                  <span>Mapped to Standard</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border-b-2 border-red-500 mr-2"></div>
                  <span>Outlier Field</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Completeness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Overall</span>
                    <span className="text-sm font-medium">{Math.round(currentData.completeness)}%</span>
                  </div>
                  <Progress value={currentData.completeness} className="h-2" />
                </div>

                {currentData.fields.slice(0, 5).map((field, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{field.name}</span>
                      <span className="text-sm font-medium">{Math.round(field.completeness)}%</span>
                    </div>
                    <Progress
                      value={field.completeness}
                      className={`h-2 ${field.isOutlier ? "bg-red-100 dark:bg-red-950" : ""}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              {currentData.correlations && currentData.correlations.length > 0 ? (
                <div className="space-y-4">
                  {currentData.correlations.slice(0, 3).map((correlation, index) => (
                    <RelationshipCard key={index} correlation={correlation} />
                  ))}
                  {currentData.correlations.length > 3 && (
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("fields")}
                      className="p-0 h-auto text-blue-600 dark:text-blue-400"
                    >
                      View all {currentData.correlations.length} relationships
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  No significant relationships detected between fields
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentData.insights.map((insight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {currentData.fields.map((field, index) => (
              <EnhancedFieldCard
                key={index}
                field={field}
                index={index}
                correlations={currentData.correlations.filter(
                  (c) => c.sourceField === field.name || c.targetField === field.name,
                )}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outliers" className="space-y-6">
          {outlierFields.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {outlierFields.map((field, index) => (
                <Card key={index} className="border-red-200 dark:border-red-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      {field.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Detected Issues:</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          <li>Inconsistent data format across entries</li>
                          <li>Contains outlier values outside expected range</li>
                          <li>Missing standardized mapping</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Sample Values:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {field.sampleValues.map((value, i) => (
                            <div key={i} className="text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded">
                              {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Outliers Detected</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  All fields appear to be consistent with expected patterns and rules.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  )
}

function RelationshipCard({ correlation }: { correlation: CorrelationData }) {
  return (
    <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
      <div className="flex items-center mb-2">
        <span className="font-medium">{correlation.sourceField}</span>
        <ArrowRight className="h-4 w-4 mx-2 text-blue-500" />
        <span>{correlation.targetField}</span>
        <Badge className="ml-auto text-xs" variant="outline">
          {Math.round(correlation.strength * 100)}% confidence
        </Badge>
      </div>
      {correlation.rule && (
        <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
          {correlation.rule}
        </div>
      )}
    </div>
  )
}

function FileStructureVisualizer({ fields }: { fields: FieldData[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex space-x-1 mb-4">
          {fields.map((field, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex-1 min-w-[120px] p-3 rounded-t-lg border-b-2 text-center font-medium ${
                field.isOutlier
                  ? "bg-red-100 dark:bg-red-900/30 border-red-500"
                  : field.standardMapping
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500"
                    : "bg-blue-100 dark:bg-blue-900/30 border-blue-500"
              }`}
            >
              {field.name}
            </motion.div>
          ))}
        </div>

        <div className="flex space-x-1 mb-2">
          {fields.map((field, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex-1 min-w-[120px] p-2 text-center text-xs bg-slate-100 dark:bg-slate-800 rounded"
            >
              {field.type}
            </motion.div>
          ))}
        </div>

        {/* Sample data rows */}
        {[0, 1].map((rowIndex) => (
          <div key={rowIndex} className="flex space-x-1 mb-1">
            {fields.map((field, colIndex) => (
              <motion.div
                key={colIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + (rowIndex * fields.length + colIndex) * 0.02 }}
                className={`flex-1 min-w-[120px] p-2 text-center text-xs truncate ${
                  field.isOutlier ? "bg-red-50 dark:bg-red-950/20" : "bg-slate-50 dark:bg-slate-900"
                }`}
              >
                {field.sampleValues[rowIndex % field.sampleValues.length] || "-"}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
