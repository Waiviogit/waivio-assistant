#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { QAWeaviateMigrationService } from '../rest/qna/qa-weaviate-migration.service';
import { AgentQaRepository } from '../persistance/agent-qa/agent-qa.repository';

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

    // Get repository and create service manually to ensure proper dependency injection
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
