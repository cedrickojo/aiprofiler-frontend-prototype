import { Suspense } from "react"
import FileUpload from "@/components/file-upload"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl mb-4">
            AI Data Profiling Platform
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload your CSV file and let our AI analyze patterns, identify business rules, and map fields to common
            standards.
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <FileUpload />
        </Suspense>
      </div>
      <Toaster />
    </main>
  )
}
