"use server"

// This is a mock implementation for demo purposes
// In a real application, this would connect to an AI service and database

interface FileUploadData {
  fileName: string
  fileType: string
  fileContent: string
  headers: string[]
  sampleRows: string[][]
}

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

// Mock database
const analysisStore: Record<string, AnalysisData> = {}

export async function analyzeFile(data: FileUploadData): Promise<string> {
  // Generate a unique ID for the file
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Process the actual headers from the CSV
  const fields = processHeaders(data.headers, data.sampleRows)

  // Analyze correlations between fields
  const correlations = analyzeCorrelations(fields, data.headers, data.sampleRows)

  // Create initial analysis data
  const initialAnalysis: AnalysisData = {
    fileId,
    fileName: data.fileName,
    status: "in_progress",
    progress: 15,
    completeness: 25,
    fields: fields,
    insights: generateInsights(fields, data.fileName, correlations),
    correlations: correlations,
  }

  // Store the analysis data
  analysisStore[fileId] = initialAnalysis

  return fileId
}

export async function getFileAnalysis(fileId: string): Promise<AnalysisData | null> {
  // Retrieve the analysis data
  return analysisStore[fileId] || null
}

// Process the actual headers from the CSV file
function processHeaders(headers: string[], sampleRows: string[][]): FieldData[] {
  // Randomly select one header to be an outlier
  const outlierIndex = Math.floor(Math.random() * headers.length)

  return headers.map((header, index) => {
    // Get all values for this column
    const columnValues = sampleRows.map((row) => (index < row.length ? row[index] : "")).filter((val) => val !== "")

    // Determine field type based on sample data
    const type = determineFieldType(sampleRows, index)

    // Get sample values for this column (limited to 4)
    const sampleValues = columnValues.slice(0, 4)

    // Calculate unique values and their distribution
    const uniqueValues = [...new Set(columnValues)]
    const valueDistribution: Record<string, number> = {}

    columnValues.forEach((value) => {
      valueDistribution[value] = (valueDistribution[value] || 0) + 1
    })

    // Generate completeness score (random for demo)
    const completeness = Math.floor(Math.random() * 30) + 70 // 70-100%

    // Determine if this is our randomly selected outlier
    const isOutlier = index === outlierIndex

    // Generate standard mapping (null for outlier)
    const standardMapping = isOutlier ? null : generateStandardMapping(header, type)

    // Generate Flume Data Model mapping
    const flumeModelMapping = generateFlumeModelMapping(header, type, isOutlier)

    // Generate patterns
    const patterns = generatePatterns(header, type, sampleValues, uniqueValues, valueDistribution)

    return {
      name: header,
      type,
      completeness,
      isOutlier,
      standardMapping,
      flumeModelMapping,
      patterns,
      sampleValues,
      uniqueValues,
      valueDistribution,
    }
  })
}

// Generate Flume Data Model mapping
function generateFlumeModelMapping(
  header: string,
  type: string,
  isOutlier: boolean,
): { field: string; confidence: number } | null {
  // If it's an outlier, there's a chance it won't map to any Flume field
  if (isOutlier && Math.random() > 0.3) {
    return null
  }

  const headerLower = header.toLowerCase()
  let field = ""
  let confidence = 0

  // ID fields
  if (headerLower.includes("id")) {
    if (headerLower.includes("customer")) {
      field = "Flume.Customer.Identifier"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("transaction")) {
      field = "Flume.Transaction.Identifier"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("product")) {
      field = "Flume.Product.Identifier"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("order")) {
      field = "Flume.Order.Identifier"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else {
      field = "Flume.Core.Identifier"
      confidence = 70 + Math.floor(Math.random() * 20)
    }
  }
  // Name fields
  else if (headerLower.includes("name")) {
    if (headerLower.includes("first")) {
      field = "Flume.Person.FirstName"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else if (headerLower.includes("last")) {
      field = "Flume.Person.LastName"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else if (headerLower.includes("product")) {
      field = "Flume.Product.Name"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else {
      field = "Flume.Core.Name"
      confidence = 75 + Math.floor(Math.random() * 15)
    }
  }
  // Contact fields
  else if (headerLower.includes("email")) {
    field = "Flume.Contact.EmailAddress"
    confidence = 90 + Math.floor(Math.random() * 10)
  } else if (headerLower.includes("phone")) {
    field = "Flume.Contact.PhoneNumber"
    confidence = 85 + Math.floor(Math.random() * 15)
  }
  // Address fields
  else if (headerLower.includes("address")) {
    if (headerLower.includes("street")) {
      field = "Flume.Address.Street"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("city")) {
      field = "Flume.Address.City"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else if (headerLower.includes("state")) {
      field = "Flume.Address.State"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else if (headerLower.includes("zip") || headerLower.includes("postal")) {
      field = "Flume.Address.PostalCode"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else if (headerLower.includes("country")) {
      field = "Flume.Address.Country"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else {
      field = "Flume.Address.FullAddress"
      confidence = 75 + Math.floor(Math.random() * 15)
    }
  }
  // Date/Time fields
  else if (type === "Date" || type === "DateTime") {
    if (headerLower.includes("created") || headerLower.includes("creation")) {
      field = "Flume.Temporal.CreationDate"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("updated") || headerLower.includes("modified")) {
      field = "Flume.Temporal.ModificationDate"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("birth")) {
      field = "Flume.Person.BirthDate"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else if (headerLower.includes("order") || headerLower.includes("purchase")) {
      field = "Flume.Order.Date"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else {
      field = "Flume.Temporal.Timestamp"
      confidence = 70 + Math.floor(Math.random() * 20)
    }
  }
  // Numeric/Amount fields
  else if (type === "Number") {
    if (headerLower.includes("price")) {
      field = "Flume.Product.Price"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("amount") || headerLower.includes("total")) {
      field = "Flume.Transaction.Amount"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("quantity") || headerLower.includes("count")) {
      field = "Flume.Product.Quantity"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("age")) {
      field = "Flume.Person.Age"
      confidence = 90 + Math.floor(Math.random() * 10)
    } else {
      field = "Flume.Core.NumericValue"
      confidence = 60 + Math.floor(Math.random() * 20)
    }
  }
  // Status fields
  else if (headerLower.includes("status")) {
    if (headerLower.includes("order")) {
      field = "Flume.Order.Status"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else if (headerLower.includes("payment")) {
      field = "Flume.Payment.Status"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else {
      field = "Flume.Core.Status"
      confidence = 75 + Math.floor(Math.random() * 15)
    }
  }
  // Description fields
  else if (headerLower.includes("description")) {
    if (headerLower.includes("product")) {
      field = "Flume.Product.Description"
      confidence = 85 + Math.floor(Math.random() * 15)
    } else {
      field = "Flume.Core.Description"
      confidence = 75 + Math.floor(Math.random() * 15)
    }
  }
  // For other fields, generate a generic mapping with lower confidence
  else {
    // For outliers, sometimes return null to indicate no mapping
    if (isOutlier && Math.random() > 0.5) {
      return null
    }

    // Generate a plausible Flume field name based on the header
    const capitalizedHeader = header.charAt(0).toUpperCase() + header.slice(1)
    field = `Flume.Derived.${capitalizedHeader}`
    confidence = 40 + Math.floor(Math.random() * 30)
  }

  // For outliers, reduce confidence
  if (isOutlier) {
    confidence = Math.max(30, confidence - 30)
  }

  return { field, confidence }
}

// Analyze correlations between fields
function analyzeCorrelations(fields: FieldData[], headers: string[], sampleRows: string[][]): CorrelationData[] {
  const correlations: CorrelationData[] = []

  // For each pair of fields, check for correlations
  for (let i = 0; i < fields.length; i++) {
    const sourceField = fields[i]

    // Check all other fields, not just adjacent ones
    for (let j = 0; j < fields.length; j++) {
      // Don't compare field to itself
      if (i === j) continue

      const targetField = fields[j]

      // For categorical fields with few unique values, look for conditional patterns
      if (sourceField.uniqueValues && sourceField.uniqueValues.length <= 5) {
        const conditionalPatterns = findConditionalPatterns(sourceField.name, targetField.name, i, j, sampleRows)

        if (conditionalPatterns) {
          correlations.push(conditionalPatterns)
        }
      }

      // For date fields, look for temporal patterns
      if (sourceField.type === "Date" || sourceField.type === "DateTime") {
        const temporalPatterns = findTemporalPatterns(sourceField.name, targetField.name, i, j, sampleRows)

        if (temporalPatterns) {
          correlations.push(temporalPatterns)
        }
      }

      // For numeric fields, check for numerical correlations
      if (sourceField.type === "Number" && targetField.type === "Number") {
        const numericalCorrelation = findNumericalCorrelation(sourceField.name, targetField.name, i, j, sampleRows)

        if (numericalCorrelation) {
          correlations.push(numericalCorrelation)
        }
      }

      // Check for first-letter correlations
      const firstLetterCorrelation = findFirstLetterCorrelation(sourceField.name, targetField.name, i, j, sampleRows)
      if (firstLetterCorrelation) {
        correlations.push(firstLetterCorrelation)
      }

      // Check for substring patterns
      const substringCorrelation = findSubstringCorrelation(sourceField.name, targetField.name, i, j, sampleRows)
      if (substringCorrelation) {
        correlations.push(substringCorrelation)
      }
    }
  }

  // Limit to top 5 strongest correlations for demo purposes
  return correlations.sort((a, b) => b.strength - a.strength).slice(0, 5)
}

// Find first-letter correlations between fields
function findFirstLetterCorrelation(
  sourceFieldName: string,
  targetFieldName: string,
  sourceIndex: number,
  targetIndex: number,
  sampleRows: string[][],
): CorrelationData | null {
  // Get all values for source and target fields
  const sourceValues = sampleRows
    .map((row) => (sourceIndex < row.length ? row[sourceIndex] : ""))
    .filter((v) => v !== "")
  const targetValues = sampleRows
    .map((row) => (targetIndex < row.length ? row[targetIndex] : ""))
    .filter((v) => v !== "")

  // Need at least 3 rows to detect a pattern
  if (sourceValues.length < 3 || targetValues.length < 3) return null

  // Check if first letter of target matches a pattern in source
  let matchCount = 0
  const examples: Array<{ condition: string; result: string }> = []

  for (let i = 0; i < Math.min(sourceValues.length, targetValues.length); i++) {
    const sourceValue = sourceValues[i]
    const targetValue = targetValues[i]

    if (targetValue.length > 0 && sourceValue.includes(targetValue[0])) {
      matchCount++

      if (examples.length < 2) {
        examples.push({
          condition: `${sourceFieldName} = "${sourceValue}"`,
          result: `${targetFieldName} starts with "${targetValue[0]}" (found in ${sourceFieldName})`,
        })
      }
    }
  }

  const matchRate = matchCount / Math.min(sourceValues.length, targetValues.length)

  // If more than 70% match, consider it a correlation
  if (matchRate > 0.7) {
    return {
      sourceField: sourceFieldName,
      targetField: targetFieldName,
      correlationType: "conditional",
      strength: 0.6 + matchRate * 0.3, // Scale strength based on match rate
      description: `First letter of ${targetFieldName} is often found within ${sourceFieldName}`,
      examples,
      rule: `${targetFieldName} typically starts with a letter contained in ${sourceFieldName}`,
    }
  }

  return null
}

// Find substring correlations between fields
function findSubstringCorrelation(
  sourceFieldName: string,
  targetFieldName: string,
  sourceIndex: number,
  targetIndex: number,
  sampleRows: string[][],
): CorrelationData | null {
  // Get all values for source and target fields
  const sourceValues = sampleRows
    .map((row) => (sourceIndex < row.length ? row[sourceIndex] : ""))
    .filter((v) => v !== "")
  const targetValues = sampleRows
    .map((row) => (targetIndex < row.length ? row[targetIndex] : ""))
    .filter((v) => v !== "")

  // Need at least 3 rows to detect a pattern
  if (sourceValues.length < 3 || targetValues.length < 3) return null

  // Check if target is a substring of source or vice versa
  let sourceInTargetCount = 0
  let targetInSourceCount = 0
  const examples: Array<{ condition: string; result: string }> = []

  for (let i = 0; i < Math.min(sourceValues.length, targetValues.length); i++) {
    const sourceValue = sourceValues[i].toLowerCase()
    const targetValue = targetValues[i].toLowerCase()

    if (targetValue.includes(sourceValue) && sourceValue.length > 2) {
      sourceInTargetCount++

      if (examples.length < 2) {
        examples.push({
          condition: `${sourceFieldName} = "${sourceValues[i]}"`,
          result: `${targetFieldName} contains "${sourceValues[i]}"`,
        })
      }
    }

    if (sourceValue.includes(targetValue) && targetValue.length > 2) {
      targetInSourceCount++

      if (examples.length < 2) {
        examples.push({
          condition: `${sourceFieldName} contains "${targetValues[i]}"`,
          result: `${targetFieldName} = "${targetValues[i]}"`,
        })
      }
    }
  }

  const sourceInTargetRate = sourceInTargetCount / Math.min(sourceValues.length, targetValues.length)
  const targetInSourceRate = targetInSourceCount / Math.min(sourceValues.length, targetValues.length)

  // If more than 70% match, consider it a correlation
  if (sourceInTargetRate > 0.7) {
    return {
      sourceField: sourceFieldName,
      targetField: targetFieldName,
      correlationType: "conditional",
      strength: 0.6 + sourceInTargetRate * 0.3,
      description: `${sourceFieldName} is often contained within ${targetFieldName}`,
      examples,
      rule: `${targetFieldName} typically contains the full value of ${sourceFieldName}`,
    }
  }

  if (targetInSourceRate > 0.7) {
    return {
      sourceField: sourceFieldName,
      targetField: targetFieldName,
      correlationType: "conditional",
      strength: 0.6 + targetInSourceRate * 0.3,
      description: `${targetFieldName} is often contained within ${sourceFieldName}`,
      examples,
      rule: `${sourceFieldName} typically contains the full value of ${targetFieldName}`,
    }
  }

  return null
}

// Find conditional patterns (e.g., when Status is "Active", CreatedDate is within last 30 days)
function findConditionalPatterns(
  sourceFieldName: string,
  targetFieldName: string,
  sourceIndex: number,
  targetIndex: number,
  sampleRows: string[][],
): CorrelationData | null {
  // Get all values for source and target fields
  const sourceValues = sampleRows.map((row) => (sourceIndex < row.length ? row[sourceIndex] : ""))
  const targetValues = sampleRows.map((row) => (targetIndex < row.length ? row[targetIndex] : ""))

  // Get unique values for source field
  const uniqueSourceValues = [...new Set(sourceValues.filter((v) => v !== ""))]

  // If too many unique values, skip
  if (uniqueSourceValues.length > 5 || uniqueSourceValues.length < 2) {
    return null
  }

  // For each unique source value, check if there's a pattern in target values
  const patterns: Array<{ sourceValue: string; targetPattern: string; count: number }> = []

  for (const sourceValue of uniqueSourceValues) {
    // Get all target values when source value matches
    const matchingTargetValues = targetValues.filter((_, index) => sourceValues[index] === sourceValue)

    // Skip if not enough matching values
    if (matchingTargetValues.length < 2) continue

    // Check for patterns in matching target values
    const uniqueTargetValues = [...new Set(matchingTargetValues)]

    if (uniqueTargetValues.length === 1) {
      // If all target values are the same when source has this value
      patterns.push({
        sourceValue,
        targetPattern: uniqueTargetValues[0],
        count: matchingTargetValues.length,
      })
    } else if (uniqueTargetValues.length < matchingTargetValues.length / 2) {
      // If there are few unique target values compared to total matches
      // Find the most common target value
      const valueCounts: Record<string, number> = {}
      matchingTargetValues.forEach((value) => {
        valueCounts[value] = (valueCounts[value] || 0) + 1
      })

      const mostCommonValue = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0][0]

      const percentage = Math.round((valueCounts[mostCommonValue] / matchingTargetValues.length) * 100)

      if (percentage > 70) {
        patterns.push({
          sourceValue,
          targetPattern: `${mostCommonValue} (${percentage}% of the time)`,
          count: valueCounts[mostCommonValue],
        })
      }
    }
  }

  // If we found patterns, create a correlation
  if (patterns.length > 0) {
    const examples = patterns.map((p) => ({
      condition: `${sourceFieldName} = "${p.sourceValue}"`,
      result: `${targetFieldName} = "${p.targetPattern}"`,
    }))

    let rule = ""
    if (patterns.length === uniqueSourceValues.length) {
      rule = `${targetFieldName} value is determined by ${sourceFieldName}`
    } else if (patterns.length > 1) {
      rule = `${targetFieldName} shows strong patterns based on ${sourceFieldName} values`
    } else {
      rule = `When ${sourceFieldName} is "${patterns[0].sourceValue}", ${targetFieldName} is typically "${patterns[0].targetPattern}"`
    }

    return {
      sourceField: sourceFieldName,
      targetField: targetFieldName,
      correlationType: "conditional",
      strength: 0.7 + Math.random() * 0.3, // Random high strength
      description: `${targetFieldName} values show patterns based on ${sourceFieldName} values`,
      examples,
      rule,
    }
  }

  return null
}

// Find temporal patterns (e.g., values increase over time)
function findTemporalPatterns(
  sourceFieldName: string,
  targetFieldName: string,
  sourceIndex: number,
  targetIndex: number,
  sampleRows: string[][],
): CorrelationData | null {
  // For demo purposes, we'll create a simulated temporal pattern for date fields
  // In a real implementation, this would analyze actual temporal trends

  // Only proceed if target field is numeric (to simulate trends over time)
  const targetValues = sampleRows.map((row) => (targetIndex < row.length ? row[targetIndex] : ""))
  const isTargetNumeric = targetValues.every((v) => v === "" || !isNaN(Number(v)))

  if (!isTargetNumeric) return null

  // Simulate finding a temporal pattern
  const shouldCreatePattern = Math.random() > 0.7 // 30% chance

  if (shouldCreatePattern) {
    const trendType = Math.random() > 0.5 ? "increasing" : "decreasing"

    return {
      sourceField: sourceFieldName,
      targetField: targetFieldName,
      correlationType: "temporal",
      strength: 0.6 + Math.random() * 0.3,
      description: `${targetFieldName} shows a ${trendType} trend over time`,
      examples: [
        {
          condition: `Earlier ${sourceFieldName}`,
          result: trendType === "increasing" ? `Lower ${targetFieldName}` : `Higher ${targetFieldName}`,
        },
        {
          condition: `Recent ${sourceFieldName}`,
          result: trendType === "increasing" ? `Higher ${targetFieldName}` : `Lower ${targetFieldName}`,
        },
      ],
      rule: `${targetFieldName} tends to ${trendType === "increasing" ? "increase" : "decrease"} over time`,
    }
  }

  return null
}

// Find numerical correlations between numeric fields
function findNumericalCorrelation(
  sourceFieldName: string,
  targetFieldName: string,
  sourceIndex: number,
  targetIndex: number,
  sampleRows: string[][],
): CorrelationData | null {
  // Get numeric values for both fields
  const pairs = sampleRows
    .map((row) => ({
      source: sourceIndex < row.length ? row[sourceIndex] : "",
      target: targetIndex < row.length ? row[targetIndex] : "",
    }))
    .filter(
      (pair) => pair.source !== "" && pair.target !== "" && !isNaN(Number(pair.source)) && !isNaN(Number(pair.target)),
    )
    .map((pair) => ({
      source: Number(pair.source),
      target: Number(pair.target),
    }))

  // Need at least 3 pairs to detect correlation
  if (pairs.length < 3) return null

  // For demo purposes, we'll simulate finding a correlation
  // In a real implementation, this would calculate actual correlation coefficient

  const shouldCreatePattern = Math.random() > 0.7 // 30% chance

  if (shouldCreatePattern) {
    const correlationType = Math.random() > 0.5 ? "positive" : "negative"
    const relationshipType = Math.random() > 0.7 ? "proportional" : "correlated"

    let rule = ""
    if (relationshipType === "proportional") {
      // Simulate finding a mathematical relationship
      const factor = (Math.random() * 5 + 1).toFixed(2)
      rule =
        correlationType === "positive"
          ? `${targetFieldName} ≈ ${factor} × ${sourceFieldName}`
          : `${targetFieldName} ≈ ${factor} × (1/${sourceFieldName})`
    } else {
      rule = `${targetFieldName} tends to ${correlationType === "positive" ? "increase" : "decrease"} as ${sourceFieldName} increases`
    }

    return {
      sourceField: sourceFieldName,
      targetField: targetFieldName,
      correlationType: "numerical",
      strength: 0.6 + Math.random() * 0.3,
      description: `${targetFieldName} shows a ${correlationType} correlation with ${sourceFieldName}`,
      examples: [
        {
          condition: `Higher ${sourceFieldName}`,
          result: correlationType === "positive" ? `Higher ${targetFieldName}` : `Lower ${targetFieldName}`,
        },
        {
          condition: `Lower ${sourceFieldName}`,
          result: correlationType === "positive" ? `Lower ${targetFieldName}` : `Higher ${targetFieldName}`,
        },
      ],
      rule,
    }
  }

  return null
}

// Determine field type based on sample data
function determineFieldType(sampleRows: string[][], columnIndex: number): string {
  // Get values for this column
  const values = sampleRows.map((row) => (columnIndex < row.length ? row[columnIndex] : "")).filter((val) => val !== "")

  if (values.length === 0) return "String"

  // Check if all values are numbers
  const allNumbers = values.every((val) => !isNaN(Number(val)))
  if (allNumbers) return "Number"

  // Check if all values are dates
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z?)?$/
  const allDates = values.every((val) => dateRegex.test(val))
  if (allDates) {
    return values[0].includes("T") ? "DateTime" : "Date"
  }

  // Check if values look like arrays
  if (values[0].startsWith("[") && values[0].endsWith("]")) {
    return "Array"
  }

  // Default to string
  return "String"
}

// Generate standard mapping based on header name and type
function generateStandardMapping(header: string, type: string): string | null {
  const headerLower = header.toLowerCase()

  // ID fields
  if (headerLower.includes("id") && headerLower.includes("customer")) {
    return "Standard.CustomerID"
  }
  if (headerLower.includes("id") && headerLower.includes("transaction")) {
    return "Standard.TransactionID"
  }
  if (headerLower.includes("id") && headerLower.includes("product")) {
    return "Standard.ProductID"
  }
  if (headerLower === "id") {
    return "Standard.ID"
  }

  // Name fields
  if (headerLower.includes("name") && headerLower.includes("first")) {
    return "Standard.Person.FirstName"
  }
  if (headerLower.includes("name") && headerLower.includes("last")) {
    return "Standard.Person.LastName"
  }
  if (headerLower === "name") {
    return "Standard.Name"
  }

  // Contact fields
  if (headerLower.includes("email")) {
    return "Standard.Contact.Email"
  }
  if (headerLower.includes("phone")) {
    return "Standard.Contact.Phone"
  }

  // Date fields
  if (type === "Date" || type === "DateTime") {
    if (headerLower.includes("created")) {
      return "Standard.Timestamp.Created"
    }
    if (headerLower.includes("updated")) {
      return "Standard.Timestamp.Updated"
    }
    if (headerLower.includes("birth")) {
      return "Standard.Person.BirthDate"
    }
    return "Standard.Timestamp.Date"
  }

  // Amount fields
  if (type === "Number" && (headerLower.includes("amount") || headerLower.includes("price"))) {
    return "Standard.Currency.Amount"
  }

  // Status fields
  if (headerLower.includes("status")) {
    return "Standard.Status"
  }

  // Description fields
  if (headerLower.includes("description")) {
    return "Standard.Description"
  }

  // For 30% of other fields, return null to simulate unmapped fields
  return Math.random() > 0.7 ? null : `Standard.${header.charAt(0).toUpperCase() + header.slice(1)}`
}

// Generate patterns based on header, type and sample values
function generatePatterns(
  header: string,
  type: string,
  sampleValues: string[],
  uniqueValues: string[],
  valueDistribution: Record<string, number>,
): string[] {
  if (sampleValues.length === 0) return []

  const patterns: string[] = []

  // Add patterns based on field type
  switch (type) {
    case "Number":
      // Check if all values have decimal places
      const hasDecimals = sampleValues.some((val) => val.includes("."))
      if (hasDecimals) {
        patterns.push("Numeric values with decimal places")
      } else {
        patterns.push("Integer values")
      }
      break

    case "Date":
      patterns.push("ISO-8601 date format (YYYY-MM-DD)")
      break

    case "DateTime":
      patterns.push("ISO-8601 datetime format")
      break

    case "String":
      // Check for email pattern
      if (sampleValues[0].includes("@")) {
        patterns.push("Valid email format")
      }
      // Check for ID pattern
      else if (header.toLowerCase().includes("id") && /^[A-Z]+-\d+$/.test(sampleValues[0])) {
        patterns.push(`Format: ${sampleValues[0].split("-")[0]}-XXXXX where X is a digit`)
      }
      // Check for capitalization
      else if (/^[A-Z][a-z]+$/.test(sampleValues[0])) {
        patterns.push("Capitalized first letter")
      }
      break

    case "Array":
      patterns.push("JSON array format")
      break
  }

  // Add patterns based on value distribution
  if (uniqueValues.length <= 5 && uniqueValues.length > 0) {
    // For fields with few unique values, list all possible values
    patterns.push(`Limited to ${uniqueValues.length} possible values: ${uniqueValues.join(", ")}`)

    // Check if one value dominates
    const totalValues = Object.values(valueDistribution).reduce((sum, count) => sum + count, 0)
    const dominantValue = Object.entries(valueDistribution).sort((a, b) => b[1] - a[1])[0]

    const dominantPercentage = Math.round((dominantValue[1] / totalValues) * 100)

    if (dominantPercentage > 70) {
      patterns.push(`Predominantly "${dominantValue[0]}" (${dominantPercentage}% of values)`)
    }
  }

  return patterns
}

// Generate insights based on fields and correlations
function generateInsights(fields: FieldData[], fileName: string, correlations: CorrelationData[]): string[] {
  const insights: string[] = ["Data appears to follow a consistent structure"]

  // Count field types
  const typeCount: Record<string, number> = {}
  fields.forEach((field) => {
    typeCount[field.type] = (typeCount[field.type] || 0) + 1
  })

  // Add insights based on field types
  if (typeCount["Date"] || typeCount["DateTime"]) {
    insights.push(`${typeCount["Date"] || 0 + typeCount["DateTime"] || 0} date fields detected with ISO-8601 format`)
  }

  if (typeCount["Number"]) {
    insights.push("Numeric fields contain potential outliers that require attention")
  }

  // Add insights based on field names
  const hasCustomerId = fields.some(
    (f) => f.name.toLowerCase().includes("customer") && f.name.toLowerCase().includes("id"),
  )
  if (hasCustomerId) {
    insights.push("Customer ID field follows standard format pattern")
  }

  const hasAmount = fields.some((f) => f.name.toLowerCase().includes("amount"))
  if (hasAmount) {
    insights.push("Transaction amounts follow expected distribution")
  }

  // Add insight about outliers
  const outlierCount = fields.filter((f) => f.isOutlier).length
  if (outlierCount > 0) {
    insights.push(`Detected ${outlierCount} field(s) with potential data quality issues`)
  }

  // Add insight about unmapped fields
  const unmappedCount = fields.filter((f) => f.standardMapping === null).length
  if (unmappedCount > 0) {
    insights.push(`${unmappedCount} field(s) require manual mapping to standards`)
  }

  // Add insight about Flume Data Model mappings
  const flumeMappedCount = fields.filter((f) => f.flumeModelMapping !== null).length
  if (flumeMappedCount > 0) {
    insights.push(`${flumeMappedCount} field(s) mapped to Flume Data Model with high confidence`)
  }

  // Add insights based on correlations
  if (correlations.length > 0) {
    insights.push(`Discovered ${correlations.length} significant relationships between fields`)

    // Add specific insights for strong correlations
    const strongCorrelations = correlations.filter((c) => c.strength > 0.8)
    if (strongCorrelations.length > 0) {
      const correlation = strongCorrelations[0]
      insights.push(`Strong relationship detected: ${correlation.rule}`)
    }

    // Add insight about first-letter correlations if any exist
    const firstLetterCorrelations = correlations.filter(
      (c) => c.description.includes("First letter") || c.description.includes("starts with"),
    )
    if (firstLetterCorrelations.length > 0) {
      insights.push("Detected patterns where field values are derived from first letters of other fields")
    }

    // Add insight about substring correlations if any exist
    const substringCorrelations = correlations.filter((c) => c.description.includes("contained within"))
    if (substringCorrelations.length > 0) {
      insights.push("Found fields that contain values from other fields as substrings")
    }
  }

  return insights
}
