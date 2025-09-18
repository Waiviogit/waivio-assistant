import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  StatisticsResponseDto,
  UserStatisticsSummaryDto,
  DateStatisticsSummaryDto,
  DateRangeStatisticsSummaryDto,
  TopUsersResponseDto,
} from '../../dto/statistics-out.dto';

export class StatisticsControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('statistics'),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Admin access required',
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
      }),
    );
  }

  static getStatisticsByUser(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get statistics by user',
        description:
          'Returns paginated statistics for a specific user across all dates',
      }),
      ApiParam({
        name: 'userName',
        description: 'Username to get statistics for',
        type: String,
        example: 'john_doe',
      }),
      ApiQuery({
        name: 'skip',
        required: false,
        description: 'Number of items to skip for pagination',
        type: Number,
        example: 0,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of items to return (1-100)',
        type: Number,
        example: 10,
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'User statistics with pagination info',
        type: StatisticsResponseDto,
      }),
    );
  }

  static getUserSummary(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get user summary statistics',
        description:
          'Returns aggregated statistics summary for a specific user including totals and unique tools used',
      }),
      ApiParam({
        name: 'userName',
        description: 'Username to get summary for',
        type: String,
        example: 'john_doe',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'User statistics summary',
        type: UserStatisticsSummaryDto,
      }),
    );
  }

  static getDateSummary(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get statistics for a specific date',
        description:
          'Returns aggregated statistics for all users on a specific date',
      }),
      ApiParam({
        name: 'dateString',
        description: 'Date in YYYY-MM-DD format',
        type: String,
        example: '2024-01-15',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Date statistics summary',
        type: DateStatisticsSummaryDto,
      }),
    );
  }

  static getDateRangeSummary(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get statistics summary for a date range',
        description:
          'Returns aggregated statistics for all users within a date range with daily breakdown',
      }),
      ApiQuery({
        name: 'startDate',
        required: true,
        description: 'Start date in YYYY-MM-DD format',
        type: String,
        example: '2024-01-01',
      }),
      ApiQuery({
        name: 'endDate',
        required: true,
        description: 'End date in YYYY-MM-DD format',
        type: String,
        example: '2024-01-31',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Date range statistics summary with daily breakdown',
        type: DateRangeStatisticsSummaryDto,
      }),
    );
  }

  static getStatisticsByDateRange(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get detailed statistics for a date range',
        description:
          'Returns paginated detailed statistics for all users within a date range',
      }),
      ApiQuery({
        name: 'startDate',
        required: true,
        description: 'Start date in YYYY-MM-DD format',
        type: String,
        example: '2024-01-01',
      }),
      ApiQuery({
        name: 'endDate',
        required: true,
        description: 'End date in YYYY-MM-DD format',
        type: String,
        example: '2024-01-31',
      }),
      ApiQuery({
        name: 'skip',
        required: false,
        description: 'Number of items to skip for pagination',
        type: Number,
        example: 0,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of items to return (1-100)',
        type: Number,
        example: 10,
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Detailed statistics with pagination info',
        type: StatisticsResponseDto,
      }),
    );
  }

  static getTopUsers(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get top users by activity',
        description:
          'Returns top users sorted by total activity (chat requests, image requests, or days active)',
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of users to return (1-100)',
        type: Number,
        example: 10,
      }),
      ApiQuery({
        name: 'sortBy',
        required: false,
        description: 'Criteria to sort users by',
        enum: ['chatRequests', 'imageRequests', 'daysActive'],
        example: 'chatRequests',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Top users with their statistics',
        type: TopUsersResponseDto,
      }),
    );
  }
}
