export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="container max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">Calorie Calculator (MVP)</h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600">
          Estimate daily energy needs. This is a minimal starting point; more inputs and results coming soon.
        </p>
        <div className="mt-8">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-white shadow-sm hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            disabled
          >
            Start Calculation
          </button>
        </div>
      </div>
    </main>
  )
}

