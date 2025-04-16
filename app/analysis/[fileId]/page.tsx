import { Suspense } from "react"
import { notFound } from "next/navigation"
import AnalysisVisualizer from "@/components/analysis-visualizer"
import AnalysisLoading from "@/components/analysis-loading"
import { getFileAnalysis } from "@/lib/actions"

interface AnalysisPageProps {
  params: {
    fileId: string
  }
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { fileId } = params

  try {
    // Fetch analysis data
    const analysisData = await getFileAnalysis(fileId)

    if (!analysisData) {
      notFound()
    }

    // Extract headers for loading component
    const headers = analysisData.fields.map((field) => field.name)

    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
            Data Analysis: {analysisData.fileName}
          </h1>

          <Suspense fallback={<AnalysisLoading headers={headers} />}>
            <AnalysisVisualizer analysisData={analysisData} />
          </Suspense>
        </div>
      </main>
    )
  } catch (error) {
    notFound()
  }
}
