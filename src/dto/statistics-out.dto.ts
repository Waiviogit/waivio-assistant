import { ApiProperty } from '@nestjs/swagger';

export class StatisticItemDto {
  @ApiProperty({ example: 'john_doe' })
  userName: string;

  @ApiProperty({ example: '2024-01-15' })
  dateString: string;

  @ApiProperty({ example: 25 })
  chatRequests: number;

  @ApiProperty({ example: 5 })
  imageRequests: number;

  @ApiProperty({
    example: ['waivioSearchTool', 'userProfileTool', 'waivioImageTool'],
    type: [String],
  })
  toolsUsed: string[];
}

export class StatisticsResponseDto {
  @ApiProperty({ type: [StatisticItemDto] })
  result: StatisticItemDto[];

  @ApiProperty({ example: true })
  hasMore: boolean;
}

export class UserStatisticsSummaryDto {
  @ApiProperty({ example: 'john_doe' })
  userName: string;

  @ApiProperty({ example: 150 })
  totalChatRequests: number;

  @ApiProperty({ example: 25 })
  totalImageRequests: number;

  @ApiProperty({ example: 15 })
  totalDaysActive: number;

  @ApiProperty({
    example: ['waivioSearchTool', 'userProfileTool', 'waivioImageTool'],
    type: [String],
  })
  uniqueToolsUsed: string[];
}

export class DateStatisticsSummaryDto {
  @ApiProperty({ example: '2024-01-15' })
  dateString: string;

  @ApiProperty({ example: 500 })
  totalChatRequests: number;

  @ApiProperty({ example: 75 })
  totalImageRequests: number;

  @ApiProperty({ example: 25 })
  totalUsers: number;

  @ApiProperty({
    example: ['waivioSearchTool', 'userProfileTool', 'waivioImageTool'],
    type: [String],
  })
  uniqueToolsUsed: string[];
}

export class DateRangeStatisticsSummaryDto {
  @ApiProperty({ example: '2024-01-01' })
  startDate: string;

  @ApiProperty({ example: '2024-01-31' })
  endDate: string;

  @ApiProperty({ example: 2500 })
  totalChatRequests: number;

  @ApiProperty({ example: 350 })
  totalImageRequests: number;

  @ApiProperty({ example: 100 })
  totalUsers: number;

  @ApiProperty({ example: 31 })
  totalDaysActive: number;

  @ApiProperty({
    example: ['waivioSearchTool', 'userProfileTool', 'waivioImageTool'],
    type: [String],
  })
  uniqueToolsUsed: string[];

  @ApiProperty({ type: [DateStatisticsSummaryDto] })
  dailyBreakdown: DateStatisticsSummaryDto[];
}

export class TopUsersResponseDto {
  @ApiProperty({ type: [UserStatisticsSummaryDto] })
  result: UserStatisticsSummaryDto[];

  @ApiProperty({ example: true })
  hasMore: boolean;
}
