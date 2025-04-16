"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { analyzeFile } from "@/lib/actions"

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    // Check file type - focusing on CSV files
    const validTypes = ["text/csv", "application/vnd.ms-excel"]

    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      })
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setFile(file)
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      // Read the file content
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async () => {
        const csvContent = reader.result?.toString()

        if (csvContent) {
          // Parse CSV headers
          const lines = csvContent.split("\n")
          if (lines.length > 0) {
            const headers = parseCSVLine(lines[0])

            // Get sample data rows (up to 5)
            const sampleRows = lines
              .slice(1, Math.min(6, lines.length))
              .filter((line) => line.trim() !== "")
              .map((line) => parseCSVLine(line))

            const fileId = await analyzeFile({
              fileName: file.name,
              fileType: file.type,
              fileContent: csvContent,
              headers: headers,
              sampleRows: sampleRows,
            })

            toast({
              title: "File uploaded successfully",
              description: "Redirecting to analysis page...",
            })

            // Redirect to the analysis page
            router.push(`/analysis/${fileId}`)
          } else {
            throw new Error("Empty CSV file")
          }
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  // Function to parse CSV line considering quoted values
  const parseCSVLine = (line: string): string[] => {
    const result = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    if (current) {
      result.push(current)
    }

    return result.map((val) => val.replace(/^"|"$/g, "").trim())
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
        <CardContent className="p-0">
          <div
            className={cn(
              "flex flex-col items-center justify-center p-12 text-center transition-colors",
              isDragging ? "bg-slate-100 dark:bg-slate-800" : "",
              file ? "py-8" : "py-16",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <Upload className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Drag and drop your CSV file</h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">or click to browse</p>
                <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <input id="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                      <FileUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={isUploading}>
                    Change
                  </Button>
                </div>
                <div className="flex justify-center mt-6">
                  <Button onClick={handleSubmit} disabled={isUploading} className="w-full sm:w-auto">
                    {isUploading ? "Uploading..." : "Start Analysis"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-start p-4 border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 rounded-lg">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-3 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-400">
          <p className="font-medium mb-1">Sample CSV files</p>
          <p>
            For testing, you can use sample datasets like
            <Button variant="link" className="h-auto p-0 text-amber-600 dark:text-amber-500 font-normal">
              customer_data.csv
            </Button>
            ,
            <Button variant="link" className="h-auto p-0 text-amber-600 dark:text-amber-500 font-normal">
              transactions.csv
            </Button>
            , or
            <Button variant="link" className="h-auto p-0 text-amber-600 dark:text-amber-500 font-normal">
              inventory.csv
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
