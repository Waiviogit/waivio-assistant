# QA Import CLI Tool

A command-line utility to import Q&A data from JSON files into MongoDB.

## Usage

### Basic Import
```bash
# Import the default qa.json file
npm run import-qa

# Import a specific file
npm run import-qa --file ./path/to/your-qa.json
npm run import-qa ./path/to/your-qa.json  # shorthand
```

### Advanced Options
```bash
# Show database statistics
npm run import-qa --stats

# Clear existing data before import
npm run import-qa --clear --file ./data/qa.json

# Clear all data (without importing)
npm run import-qa --clear --stats
```

### Help
```bash
npm run import-qa --help
```

## JSON Format

The JSON file should contain an array of Q&A objects with the following structure:

```json
[
  {
    "question": "What is Waivio?",
    "answer": "Waivio is a social media platform...",
    "topic": "WaivioGeneral"
  },
  {
    "question": "How do I create a campaign?",
    "answer": "To create a campaign, go to...",
    "topic": "CampaignManagement"
  }
]
```

### Required Fields
- `question` (string): The question text
- `answer` (string): The answer text  
- `topic` (string): The topic/category for the Q&A

## Environment Variables

- `MONGO_URI_WAIVIO`: MongoDB connection string (default: `mongodb://localhost:27017/waivio`)

## Features

- ✅ Validates JSON format and required fields
- ✅ Progress tracking with batch logging
- ✅ Error handling and detailed logging
- ✅ Database statistics and topic distribution
- ✅ Option to clear existing data
- ✅ Duplicate prevention (unique index on question + answer)
- ✅ Data trimming and cleanup

## Error Handling

- Invalid JSON format detection
- Missing required fields validation
- Database connection error handling
- Duplicate entry handling (via unique index)
- Progress tracking with error counts

## Examples

```bash
# Standard workflow
npm run import-qa                                    # Import default file
npm run import-qa --stats                           # Check what was imported

# Custom file import
npm run import-qa --file ./custom-qa.json

# Fresh import (clear and import)
npm run import-qa --clear --file ./fresh-data.json

# Just check current database state
npm run import-qa --stats
```

## Database Schema

The tool creates documents in the `waivio_agent_qa` collection with:

```typescript
{
  question: string,    // Required, indexed
  answer: string,      // Required, indexed  
  topic: string,       // Required, indexed
}
```

Unique index: `{ question: 1, answer: 1 }`
Topic index: `{ topic: 1 }`
