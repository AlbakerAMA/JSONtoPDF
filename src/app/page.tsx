'use client';

import { useState } from 'react';
import { WorkoutData } from '@/lib/pdfGenerator';

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    filename: string;
    downloadUrl: string;
    expiresAt: string | null;
  };
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [jsonInput, setJsonInput] = useState(JSON.stringify({
    title: "Weekly Workout Plan",
    description: "A comprehensive 5-day workout routine designed for intermediate fitness levels.",
    schedule: [
      {
        day: "Monday - Chest & Triceps",
        exercises: [
          {
            name: "Bench Press",
            sets: 4,
            reps: 8,
            notes: "Use progressive overload"
          },
          {
            name: "Incline Dumbbell Press",
            sets: 3,
            reps: 10
          },
          {
            name: "Tricep Dips",
            sets: 3,
            reps: 12,
            notes: "Bodyweight or assisted"
          },
          {
            name: "Push-ups",
            sets: 3,
            reps: 15,
            notes: "Perfect form focus"
          }
        ]
      },
      {
        day: "Tuesday - Back & Biceps",
        exercises: [
          {
            name: "Pull-ups",
            sets: 4,
            reps: 6,
            notes: "Use assistance if needed"
          },
          {
            name: "Barbell Rows",
            sets: 4,
            reps: 8
          },
          {
            name: "Bicep Curls",
            sets: 3,
            reps: 12
          }
        ]
      },
      {
        day: "Wednesday - Rest Day",
        exercises: [
          {
            name: "Light Cardio",
            duration: "20-30 minutes",
            notes: "Walking, light jogging, or yoga"
          }
        ]
      },
      {
        day: "Thursday - Legs",
        exercises: [
          {
            name: "Squats",
            sets: 4,
            reps: 10,
            notes: "Focus on depth and form"
          },
          {
            name: "Deadlifts",
            sets: 3,
            reps: 8,
            notes: "Keep back straight"
          },
          {
            name: "Lunges",
            sets: 3,
            reps: 12,
            notes: "Each leg"
          }
        ]
      },
      {
        day: "Friday - Shoulders & Core",
        exercises: [
          {
            name: "Overhead Press",
            sets: 4,
            reps: 8
          },
          {
            name: "Lateral Raises",
            sets: 3,
            reps: 12
          },
          {
            name: "Plank",
            duration: "1 minute",
            sets: 3,
            notes: "Hold steady position"
          }
        ]
      }
    ],
    metadata: {
      createdBy: "Fitness Coach Pro",
      createdAt: "2024-01-15",
      duration: "5 days per week",
      difficulty: "Intermediate"
    }
  }, null, 2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      // Parse and validate JSON
      const data: WorkoutData = JSON.parse(jsonInput);
      
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          options: {
            autoCleanup: true,
            cleanupDelayMs: 300000 // 5 minutes
          }
        }),
      });

      const result: ApiResponse = await res.json();
      setResponse(result);

    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          PDF Generator API
        </h1>
        <p className="text-gray-600 text-lg">
          Generate custom workout PDFs from JSON data
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Test the API</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
              JSON Workout Data:
            </label>
            <textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="Enter your workout JSON data here..."
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Generating PDF...
              </>
            ) : (
              'Generate PDF'
            )}
          </button>
        </form>
      </div>

      {response && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Response</h2>
          
          {response.success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    PDF Generated Successfully!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Filename: {response.data?.filename}</p>
                    {response.data?.expiresAt && (
                      <p>Expires at: {new Date(response.data.expiresAt).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => response.data?.downloadUrl && handleDownload(response.data.downloadUrl)}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Occurred
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{response.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">API Usage</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium">Generate PDF:</h3>
            <code className="bg-gray-200 p-2 rounded block mt-1">
              POST /api/generate-pdf
            </code>
          </div>
          <div>
            <h3 className="font-medium">Download PDF:</h3>
            <code className="bg-gray-200 p-2 rounded block mt-1">
              GET /api/download?file=filename.pdf
            </code>
          </div>
          <div>
            <h3 className="font-medium">Features:</h3>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Serverless deployment on Vercel</li>
              <li>Automatic file cleanup (configurable)</li>
              <li>Concurrent request handling</li>
              <li>Fast PDF generation with PDFKit</li>
              <li>Secure file downloads</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}