#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { AgentQaRepository } from '../persistance/agent-qa/agent-qa.repository';
import {
  dropWeaviateIndex,
  createQAWeaviateIndex,
} from '../assistant/store/weaviateStore';
import { QA_COLLECTION } from '../assistant/constants/nodes';
import { AgentQADocType } from '../persistance/agent-qa/types';

interface QAItem {
  question: string;
  answer: string;
  topic: string;
}

class QAWeaviateMigrationService {
  private readonly logger = new Logger(QAWeaviateMigrationService.name);
  private readonly batchSize = 1000; // Process in batches to avoid memory issues

  constructor(private readonly agentQaRepository: AgentQaRepository) {}

  async migrateQADataToWeaviate(): Promise<void> {
    try {
      this.logger.log('Starting QA migration from MongoDB to Weaviate...');

      // Step 1: Drop existing Weaviate QA collection
      this.logger.log(
        `Dropping existing Weaviate collection: ${QA_COLLECTION}`,
      );
      await dropWeaviateIndex(QA_COLLECTION);

      // Step 2: Get total count for progress tracking
      const totalCount = await this.getTotalCount();
      this.logger.log(`Found ${totalCount} QA items in MongoDB to migrate`);

      if (totalCount === 0) {
        this.logger.warn('No QA items found in MongoDB. Migration complete.');
        return;
      }

      // Step 3: Migrate data using cursor-based pagination
      await this.migrateInBatches(totalCount);

      this.logger.log('QA migration to Weaviate completed successfully!');
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`);
      throw error;
    }
  }

  private async getTotalCount(): Promise<number> {
    try {
      const result = await this.agentQaRepository.find({ filter: {} });
      return result.length;
    } catch (error) {
      this.logger.error('Failed to get total count:', error.message);
      return 0;
    }
  }

  private async migrateInBatches(totalCount: number): Promise<void> {
    let processedCount = 0;
    let skip = 0;
    const allQAItems: QAItem[] = [];

    while (processedCount < totalCount) {
      this.logger.log(
        `Processing batch: ${processedCount + 1}-${Math.min(processedCount + this.batchSize, totalCount)} of ${totalCount}`,
      );

      try {
        // Get batch of QA items using skip/limit
        const batch = await this.getBatch(skip, this.batchSize);
        if (batch.length === 0) {
          this.logger.warn(
            `No more items found. Stopping at ${processedCount} items.`,
          );
          break;
        }

        // Convert MongoDB documents to QA items
        const qaItems = batch.map((doc: AgentQADocType) => ({
          question: doc.question,
          answer: doc.answer,
          topic: doc.topic,
        }));

        allQAItems.push(...qaItems);
        processedCount += batch.length;
        skip += this.batchSize;

        this.logger.log(
          `Collected ${processedCount}/${totalCount} items so far...`,
        );

        // Avoid overwhelming memory - create Weaviate index when we have enough items
        if (allQAItems.length >= 5000 || processedCount >= totalCount) {
          await this.createWeaviateIndex(allQAItems);
          allQAItems.length = 0; // Clear the array
        }
      } catch (error) {
        this.logger.error(
          `Error processing batch starting at ${skip}:`,
          error.message,
        );
        throw error;
      }
    }

    // Handle any remaining items
    if (allQAItems.length > 0) {
      await this.createWeaviateIndex(allQAItems);
    }
  }

  private async getBatch(
    skip: number,
    limit: number,
  ): Promise<AgentQADocType[]> {
    try {
      const result = await this.agentQaRepository.find({
        filter: {},
        options: {
          skip,
          limit,
          lean: true,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching batch (skip: ${skip}, limit: ${limit}):`,
        error.message,
      );
      throw error;
    }
  }

  private async createWeaviateIndex(qaItems: QAItem[]): Promise<void> {
    if (qaItems.length === 0) return;

    try {
      this.logger.log(
        `Creating Weaviate index with ${qaItems.length} items...`,
      );
      await createQAWeaviateIndex(qaItems, QA_COLLECTION);
      this.logger.log(
        `Successfully indexed ${qaItems.length} items to Weaviate`,
      );
    } catch (error) {
      this.logger.error('Error creating Weaviate index:', error.message);
      throw error;
    }
  }

  async getStats(): Promise<void> {
    try {
      const totalCount = await this.getTotalCount();
      const topicGroups = await this.agentQaRepository.aggregate({
        pipeline: [
          { $group: { _id: '$topic', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
      });

      this.logger.log(`\n=== MongoDB QA Statistics ===`);
      this.logger.log(`Total QA items: ${totalCount}`);
      this.logger.log(`Topics distribution:`);

      const topics = await topicGroups;
      topics.forEach((topic: any) => {
        this.logger.log(`  ${topic._id}: ${topic.count} items`);
      });
    } catch (error) {
      this.logger.error('Failed to get stats:', error.message);
    }
  }
}

async function main() {
  // Load environment variables
  dotenv.config();

  const logger = new Logger('QA-Weaviate-Migration');

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let showStats = false;
    let migrate = true;

    for (const arg of args) {
      if (arg === '--stats' || arg === '-s') {
        showStats = true;
        migrate = false;
      } else if (arg === '--help' || arg === '-h') {
        printHelp();
        process.exit(0);
      }
    }

    // Create NestJS application
    logger.log('Initializing application...');
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const agentQaRepository = app.get(AgentQaRepository);
    const migrationService = new QAWeaviateMigrationService(agentQaRepository);

    // Handle different operations
    if (showStats) {
      await migrationService.getStats();
    }

    if (migrate) {
      await migrationService.migrateQADataToWeaviate();
    }

    await app.close();
    logger.log('Operation completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`CLI failed: ${error.message}`);
    logger.debug(error.stack);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
QA to Weaviate Migration CLI Tool

Usage:
  npm run migrate-qa-weaviate [options]
  
Options:
  -s, --stats          Show MongoDB QA statistics without migrating
  -h, --help           Show this help message

Examples:
  npm run migrate-qa-weaviate                 # Migrate all QA data from MongoDB to Weaviate
  npm run migrate-qa-weaviate --stats         # Show current MongoDB statistics

Environment Variables:
  MONGO_URI_WAIVIO     MongoDB connection string
  WEAVIATE_HOST        Weaviate host (default: localhost:8080)
  OPENAI_API_KEY       OpenAI API key for embeddings

Note: This tool will drop the existing Weaviate QA collection before migration.
`);
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main();
}

export { QAWeaviateMigrationService };
