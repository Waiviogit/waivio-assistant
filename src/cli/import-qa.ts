#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from '../app.module';
import { AgentQaRepository } from '../persistance/agent-qa/agent-qa.repository';

interface QAItem {
  question: string;
  answer: string;
  topic: string;
}

class QAImportService {
  private readonly logger = new Logger(QAImportService.name);

  constructor(private readonly agentQaRepository: AgentQaRepository) {}

  async importFromFile(filePath: string): Promise<void> {
    try {
      this.logger.log(`Starting import from file: ${filePath}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const qaData: QAItem[] = JSON.parse(fileContent);

      if (!Array.isArray(qaData)) {
        throw new Error('Invalid JSON format: expected an array of QA items');
      }

      this.logger.log(`Found ${qaData.length} QA items to import`);

      // Clear existing data (optional - uncomment if you want to clear before import)
      // await this.clearExistingData();

      // Import data with progress tracking
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < qaData.length; i++) {
        const item = qaData[i];

        try {
          await this.validateQAItem(item, i);

          const result = await this.agentQaRepository.create({
            question: item.question.trim(),
            answer: item.answer.trim(),
            topic: item.topic.trim(),
          });

          if (result) {
            successCount++;
            if (successCount % 50 === 0) {
              this.logger.log(
                `Imported ${successCount}/${qaData.length} items...`,
              );
            }
          } else {
            errorCount++;
            this.logger.warn(
              `Failed to create item ${i + 1}: ${item.question.substring(0, 50)}...`,
            );
          }
        } catch (error) {
          errorCount++;
          this.logger.error(`Error importing item ${i + 1}: ${error.message}`);
          this.logger.debug(`Item data: ${JSON.stringify(item, null, 2)}`);
        }
      }

      this.logger.log(
        `Import completed: ${successCount} successful, ${errorCount} failed`,
      );

      if (errorCount > 0) {
        this.logger.warn(
          `${errorCount} items failed to import. Check logs above for details.`,
        );
      }
    } catch (error) {
      this.logger.error(`Import failed: ${error.message}`);
      throw error;
    }
  }

  private validateQAItem(item: QAItem, index: number): void {
    if (!item || typeof item !== 'object') {
      throw new Error(`Item ${index + 1}: Invalid item format`);
    }

    if (
      !item.question ||
      typeof item.question !== 'string' ||
      !item.question.trim()
    ) {
      throw new Error(`Item ${index + 1}: Missing or invalid question`);
    }

    if (
      !item.answer ||
      typeof item.answer !== 'string' ||
      !item.answer.trim()
    ) {
      throw new Error(`Item ${index + 1}: Missing or invalid answer`);
    }

    if (!item.topic || typeof item.topic !== 'string' || !item.topic.trim()) {
      throw new Error(`Item ${index + 1}: Missing or invalid topic`);
    }
  }

  private async clearExistingData(): Promise<void> {
    this.logger.log('Clearing existing QA data...');
    const result = await this.agentQaRepository.deleteMany({ filter: {} });
    this.logger.log(`Cleared ${result.deletedCount} existing records`);
  }

  async getStats(): Promise<void> {
    const totalCount = await this.agentQaRepository.find({ filter: {} });
    const topicGroups = await this.agentQaRepository.aggregate({
      pipeline: [
        { $group: { _id: '$topic', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ],
    });

    this.logger.log(`\n=== Database Statistics ===`);
    this.logger.log(`Total QA items: ${totalCount.length}`);
    this.logger.log(`Topics distribution:`);

    const topics = await topicGroups;
    topics.forEach((topic: any) => {
      this.logger.log(`  ${topic._id}: ${topic.count} items`);
    });
  }
}

async function main() {
  // Load environment variables
  dotenv.config();

  const logger = new Logger('CLI');

  try {
    // Get file path from command line arguments
    const args = process.argv.slice(2);
    let filePath = '';
    let showStats = false;
    let clearData = false;

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--file' || arg === '-f') {
        filePath = args[i + 1];
        i++; // Skip next argument
      } else if (arg === '--stats' || arg === '-s') {
        showStats = true;
      } else if (arg === '--clear' || arg === '-c') {
        clearData = true;
      } else if (arg === '--help' || arg === '-h') {
        printHelp();
        process.exit(0);
      } else if (!filePath && !arg.startsWith('-')) {
        filePath = arg;
      }
    }

    // Default to qa.json if no file specified
    if (!filePath && !showStats) {
      filePath = path.join(process.cwd(), 'src/assistant/lib/qa.json');
      logger.log(`No file specified, using default: ${filePath}`);
    }

    // Create NestJS application
    logger.log('Initializing application...');
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const agentQaRepository = app.get(AgentQaRepository);
    const importService = new QAImportService(agentQaRepository);

    // Handle different operations
    if (clearData) {
      logger.log('Clearing all existing data...');
      const result = await agentQaRepository.deleteMany({ filter: {} });
      logger.log(`Cleared ${result.deletedCount} records`);
    }

    if (filePath) {
      await importService.importFromFile(filePath);
    }

    if (showStats || filePath) {
      await importService.getStats();
    }

    await app.close();
    logger.log('Import completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`CLI failed: ${error.message}`);
    logger.debug(error.stack);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
QA Import CLI Tool

Usage:
  npm run import-qa [options] [file]
  
Options:
  -f, --file <path>     Path to JSON file to import (default: src/assistant/lib/qa.json)
  -s, --stats          Show database statistics
  -c, --clear          Clear all existing data before import
  -h, --help           Show this help message

Examples:
  npm run import-qa                                    # Import default qa.json file
  npm run import-qa --file ./data/custom-qa.json      # Import custom file
  npm run import-qa --stats                           # Show current database stats
  npm run import-qa --clear --file ./data/qa.json     # Clear and import
  npm run import-qa ./path/to/qa.json                 # Import specific file (shorthand)

Environment Variables:
  MONGO_URI_WAIVIO     MongoDB connection string (default: mongodb://localhost:27017/waivio)
`);
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main();
}

export { QAImportService };
