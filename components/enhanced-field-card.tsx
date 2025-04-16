"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"

interface FieldData {
  name: string
  type: string
  completeness: number
  isOutlier: boolean
  standardMapping: string | null
  flumeModelMapping: {
    field: string
    confidence: number
  } | null
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

interface EnhancedFieldCardProps {
  field: FieldData
  index: number
  correlations: CorrelationData[]
}

export default function EnhancedFieldCard({ field, index, correlations }: EnhancedFieldCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasCorrelations = correlations.length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className={field.isOutlier ? "border-red-200 dark:border-red-900" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {field.name}
              {field.isOutlier && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="ml-2"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </motion.span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Badge>{field.type}</Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setExpanded(!expanded)}
                aria-label={expanded ? "Collapse field details" : "Expand field details"}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Completeness</span>
                <span className="text-sm font-medium">{Math.round(field.completeness)}%</span>
              </div>
              <Progress
                value={field.completeness}
                className={`h-2 ${field.isOutlier ? "bg-red-100 dark:bg-red-950" : ""}`}
              />
            </div>

            {field.standardMapping && (
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Standard Mapping:</span>
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                >
                  {field.standardMapping}
                </Badge>
              </div>
            )}

            {/* Flume Data Model Mapping */}
            {field.flumeModelMapping && (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">Flume Data Model:</span>
                <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/30 p-2 rounded-md">
                  <Badge
                    variant="outline"
                    className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700"
                  >
                    {field.flumeModelMapping.field}
                  </Badge>
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                      {field.flumeModelMapping.confidence}% confidence
                    </span>
                    <div className="ml-2 w-16 h-2 bg-purple-200 dark:bg-purple-900/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 dark:bg-purple-600 rounded-full"
                        style={{ width: `${field.flumeModelMapping.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Patterns section - always visible */}
            {field.patterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Detected Patterns:</h4>
                <div className="space-y-2">
                  {field.patterns.map((pattern, i) => (
                    <div key={i} className="text-sm bg-slate-50 dark:bg-slate-900 p-2 rounded">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Field Relationships & Correlations section */}
            {hasCorrelations && (
              <div>
                <h4 className="text-sm font-medium mb-2">Field Relationships & Correlations:</h4>
                <div className="space-y-2">
                  {correlations.map((correlation, i) => (
                    <div key={i} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <span className="font-medium">
                          {correlation.sourceField === field.name ? correlation.sourceField : correlation.targetField}
                        </span>
                        <ArrowRight className="h-4 w-4 mx-2 text-blue-500" />
                        <span>
                          {correlation.sourceField === field.name ? correlation.targetField : correlation.sourceField}
                        </span>
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
                  ))}
                </div>
              </div>
            )}

            {/* Expanded content */}
            {expanded && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-4">
                {/* Value distribution if available */}
                {field.uniqueValues && field.uniqueValues.length > 0 && field.valueDistribution && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Value Distribution:</h4>
                    <div className="space-y-2">
                      {Object.entries(field.valueDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([value, count], i) => (
                          <div key={i} className="flex items-center">
                            <div className="text-sm w-1/3 truncate">{value}</div>
                            <div className="w-2/3 pl-2">
                              <div className="h-5 bg-blue-100 dark:bg-blue-900/30 rounded-sm relative">
                                <div
                                  className="h-full bg-blue-500 dark:bg-blue-600 rounded-sm"
                                  style={{
                                    width: `${
                                      (count /
                                        Math.max(...Object.values(field.valueDistribution as Record<string, number>))) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                                <span className="absolute right-2 top-0 text-xs font-medium">
                                  {count} occurrence{count !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Sample values - moved to expanded section */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Sample Values:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {field.sampleValues.map((value, i) => (
                      <div
                        key={i}
                        className={`text-sm p-2 rounded ${
                          field.isOutlier ? "bg-red-50 dark:bg-red-950/30" : "bg-slate-50 dark:bg-slate-900"
                        }`}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed correlation examples */}
                {hasCorrelations && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Correlation Examples:</h4>
                    <div className="space-y-3">
                      {correlations.map((correlation, i) => (
                        <div key={i} className="space-y-2">
                          <div className="text-xs font-medium">{correlation.description}</div>
                          {correlation.examples && correlation.examples.length > 0 && (
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              {correlation.examples.map((example, j) => (
                                <div key={j} className="grid grid-cols-2 gap-2">
                                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded">{example.condition}</div>
                                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded flex items-center">
                                    <ArrowRight className="h-3 w-3 mr-1 text-slate-400" />
                                    {example.result}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
