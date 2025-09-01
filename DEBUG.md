# PDF Generator API - Debugging Guide

## 500 Error Troubleshooting

The API has been enhanced with detailed logging to help identify the root cause of the 500 error.

## Test Payload

Use this JSON payload to test the `/api/generate-pdf` endpoint:

```json
{
  "data": {
    "title": "Test Workout Plan",
    "description": "A simple test workout to verify PDF generation",
    "metadata": {
      "createdBy": "Test User",
      "createdAt": "2024-01-01",
      "duration": "30 minutes",
      "difficulty": "Beginner"
    },
    "schedule": [
      {
        "day": "Monday",
        "exercises": [
          {
            "name": "Push-ups",
            "sets": 3,
            "reps": 10,
            "notes": "Rest 30 seconds between sets"
          },
          {
            "name": "Plank",
            "duration": "30 seconds",
            "notes": "Keep core tight"
          }
        ]
      }
    ]
  },
  "options": {
    "autoCleanup": true,
    "cleanupDelayMs": 300000
  }
}
```

## Checking Logs

After deploying, check the Vercel function logs to see the detailed error messages:

1. Go to your Vercel dashboard
2. Click on your project
3. Go to the "Functions" tab
4. Click on the failed function execution
5. Check the logs for detailed error information

## Common Issues and Solutions

### 1. Canvas Dependency Missing
- **Symptom**: Error about canvas or Cairo
- **Solution**: The `canvas` package has been added to dependencies

### 2. File System Permissions
- **Symptom**: Error creating temp directory
- **Solution**: Vercel should handle this automatically

### 3. PDFKit Font Issues
- **Symptom**: Font loading errors
- **Solution**: Use only built-in fonts (Helvetica, Times-Roman, Courier)

### 4. Memory Issues
- **Symptom**: Out of memory errors
- **Solution**: Reduce PDF complexity or increase function memory

## Alternative Testing

If the main endpoint fails, you can test individual components:

1. **Test temp directory creation**:
   ```bash
   curl -X GET https://your-domain.vercel.app/api/cleanup
   ```

2. **Check function limits**:
   - Ensure the PDF generation completes within 30 seconds (current maxDuration)
   - Check if the generated file size is reasonable

## Next Steps

1. Deploy the updated code with enhanced logging
2. Test with the provided payload
3. Check Vercel function logs for specific error details
4. Report back the specific error message for targeted troubleshooting