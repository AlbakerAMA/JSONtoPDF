# PDF Generator API

A serverless API built with Next.js and deployed on Vercel that accepts JSON payload and returns downloadable PDFs. Perfect for generating workout schedules, reports, or any structured documents.

## 🚀 Features

- **Serverless Architecture**: Optimized for Vercel deployment
- **Fast PDF Generation**: Uses PDFKit for efficient document creation
- **Automatic Cleanup**: Temporary files are cleaned up automatically
- **Concurrent Requests**: Handles multiple requests efficiently
- **Secure Downloads**: Validates file access and prevents unauthorized downloads
- **Flexible Data Structure**: Accepts various JSON formats for different document types
- **TypeScript Support**: Full type safety throughout the application

## 🛠️ Technologies

- **Backend**: Next.js 14 with App Router
- **PDF Library**: PDFKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📋 API Endpoints

### Generate PDF
```
POST /api/generate-pdf
```

**Request Body:**
```json
{
  "data": {
    "title": "Weekly Workout Plan",
    "description": "A comprehensive workout routine",
    "schedule": [
      {
        "day": "Monday - Chest & Triceps",
        "exercises": [
          {
            "name": "Bench Press",
            "sets": 4,
            "reps": 8,
            "notes": "Use progressive overload"
          }
        ]
      }
    ],
    "metadata": {
      "createdBy": "Fitness Coach",
      "createdAt": "2024-01-15",
      "duration": "5 days per week",
      "difficulty": "Intermediate"
    }
  },
  "options": {
    "autoCleanup": true,
    "cleanupDelayMs": 300000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "PDF generated successfully",
  "data": {
    "filename": "workout_uuid.pdf",
    "downloadUrl": "/api/download?file=workout_uuid.pdf",
    "expiresAt": "2024-01-15T12:05:00.000Z"
  }
}
```

### Download PDF
```
GET /api/download?file=workout_uuid.pdf
```

**Response**: PDF file download

### Cleanup (Cron Job)
```
GET /api/cleanup
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed",
  "details": {
    "filesScanned": 10,
    "filesCleaned": 5,
    "errors": 0
  }
}
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdf-generator-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect Next.js and deploy
   - Set environment variables in Vercel dashboard if needed

3. **Configure Custom Domain** (Optional)
   - Add your custom domain in Vercel dashboard
   - Update DNS settings as instructed

## 📁 Project Structure

```
pdf-generator-api/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-pdf/
│   │   │   │   └── route.ts          # PDF generation endpoint
│   │   │   ├── download/
│   │   │   │   └── route.ts          # File download endpoint
│   │   │   └── cleanup/
│   │   │       └── route.ts          # Cleanup cron job
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage with demo
│   └── lib/
│       └── pdfGenerator.ts           # PDF generation utilities
├── tmp/                              # Temporary PDF storage
├── vercel.json                       # Vercel configuration
├── next.config.js                    # Next.js configuration
└── package.json                      # Dependencies and scripts
```

## 🎯 Usage Examples

### Basic Workout Schedule
```javascript
const workoutData = {
  title: "Monday Workout",
  schedule: [
    {
      day: "Chest Day",
      exercises: [
        {
          name: "Push-ups",
          sets: 3,
          reps: 15,
          notes: "Keep core tight"
        }
      ]
    }
  ]
};

const response = await fetch('/api/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: workoutData })
});
```

### Custom Document
```javascript
const customData = {
  title: "Meeting Notes",
  description: "Weekly team meeting summary",
  schedule: [
    {
      day: "Action Items",
      exercises: [
        {
          name: "Review project timeline",
          notes: "Due by Friday"
        }
      ]
    }
  ]
};
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PDF_CLEANUP_DELAY_MS` | Cleanup delay in milliseconds | `300000` |
| `PDF_MAX_FILE_AGE_MS` | Max file age before cleanup | `14400000` |

### Vercel Configuration

The `vercel.json` file includes:
- Function timeout settings
- Cron job for automatic cleanup
- Optimized build settings

## 🔒 Security Features

- **File Validation**: Strict filename validation prevents path traversal
- **Temporary Storage**: Files are automatically cleaned up
- **Rate Limiting**: Built-in protection against abuse
- **Type Safety**: TypeScript ensures data integrity

## 🚨 Error Handling

The API includes comprehensive error handling:
- JSON validation errors
- File system errors
- PDF generation failures
- Network timeouts

## 📈 Performance Optimizations

- **Serverless Functions**: Fast cold starts
- **Automatic Cleanup**: Prevents storage bloat
- **Efficient PDF Generation**: Optimized PDFKit usage
- **Concurrent Processing**: Handles multiple requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔄 API Versioning

Current version: `v1`

Future versions will maintain backward compatibility when possible.