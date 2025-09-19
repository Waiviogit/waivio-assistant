import { Injectable } from '@nestjs/common';
import { AgentStatisticRepository } from '../../persistance/agent-statistic/agent-statistic.repository';
import {
  StatisticItemDto,
  StatisticsResponseDto,
  UserStatisticsSummaryDto,
  DateStatisticsSummaryDto,
  DateRangeStatisticsSummaryDto,
  TopUsersResponseDto,
} from '../../dto/statistics-out.dto';
import { AgentStatisticDocType } from '../../persistance/agent-statistic/types';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly agentStatisticRepository: AgentStatisticRepository,
  ) {}

  async getStatisticsByUser(
    userName: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<StatisticsResponseDto> {
    const { result, hasMore } =
      await this.agentStatisticRepository.getStatisticsByUser(
        userName,
        skip,
        limit,
      );

    return {
      result: result.map(this.mapToDto),
      hasMore,
    };
  }

  async getStatisticsByDateRange(
    startDate: string,
    endDate: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<StatisticsResponseDto> {
    const { result, hasMore } =
      await this.agentStatisticRepository.getStatisticsByDateRange(
        startDate,
        endDate,
        skip,
        limit,
      );

    return {
      result: result.map(this.mapToDto),
      hasMore,
    };
  }

  async getUserSummary(userName: string): Promise<UserStatisticsSummaryDto> {
    // Get all statistics for the user
    const { result } = await this.agentStatisticRepository.getStatisticsByUser(
      userName,
      0,
      1000, // Large limit to get all records
    );

    const totalChatRequests = result.reduce(
      (sum, stat) => sum + stat.chatRequests,
      0,
    );
    const totalImageRequests = result.reduce(
      (sum, stat) => sum + stat.imageRequests,
      0,
    );
    const totalDaysActive = result.length;

    // Get all unique tools used by this user
    const allTools = result.flatMap((stat) => stat.toolsUsed);
    const uniqueToolsUsed = [...new Set(allTools)];

    return {
      userName,
      totalChatRequests,
      totalImageRequests,
      totalDaysActive,
      uniqueToolsUsed,
    };
  }

  async getDateSummary(dateString: string): Promise<DateStatisticsSummaryDto> {
    // Get all statistics for the specific date
    const { result } =
      await this.agentStatisticRepository.getStatisticsByDateRange(
        dateString,
        dateString,
        0,
        1000, // Large limit to get all records
      );

    const totalChatRequests = result.reduce(
      (sum, stat) => sum + stat.chatRequests,
      0,
    );
    const totalImageRequests = result.reduce(
      (sum, stat) => sum + stat.imageRequests,
      0,
    );
    const totalUsers = result.length;

    // Get all unique tools used on this date
    const allTools = result.flatMap((stat) => stat.toolsUsed);
    const uniqueToolsUsed = [...new Set(allTools)];

    return {
      dateString,
      totalChatRequests,
      totalImageRequests,
      totalUsers,
      uniqueToolsUsed,
    };
  }

  async getDateRangeSummary(
    startDate: string,
    endDate: string,
  ): Promise<DateRangeStatisticsSummaryDto> {
    // Get all statistics for the date range
    const { result } =
      await this.agentStatisticRepository.getStatisticsByDateRange(
        startDate,
        endDate,
        0,
        10000, // Very large limit to get all records
      );

    const totalChatRequests = result.reduce(
      (sum, stat) => sum + stat.chatRequests,
      0,
    );
    const totalImageRequests = result.reduce(
      (sum, stat) => sum + stat.imageRequests,
      0,
    );

    // Get unique users
    const uniqueUsers = new Set(result.map((stat) => stat.userName));
    const totalUsers = uniqueUsers.size;

    // Get unique dates
    const uniqueDates = new Set(result.map((stat) => stat.dateString));
    const totalDaysActive = uniqueDates.size;

    // Get all unique tools used in the date range
    const allTools = result.flatMap((stat) => stat.toolsUsed);
    const uniqueToolsUsed = [...new Set(allTools)];

    // Create daily breakdown
    const dailyBreakdown: DateStatisticsSummaryDto[] = [];
    for (const date of uniqueDates) {
      const dailySummary = await this.getDateSummary(date);
      dailyBreakdown.push(dailySummary);
    }

    // Sort daily breakdown by date
    dailyBreakdown.sort((a, b) => a.dateString.localeCompare(b.dateString));

    return {
      startDate,
      endDate,
      totalChatRequests,
      totalImageRequests,
      totalUsers,
      totalDaysActive,
      uniqueToolsUsed,
      dailyBreakdown,
    };
  }

  async getTopUsers(
    limit: number = 10,
    sortBy: 'chatRequests' | 'imageRequests' | 'daysActive' = 'chatRequests',
  ): Promise<TopUsersResponseDto> {
    // Get all statistics to aggregate by user
    const { result } =
      await this.agentStatisticRepository.getStatisticsByDateRange(
        '2020-01-01', // Very early date to get all records
        '2030-12-31', // Very late date to get all records
        0,
        10000, // Very large limit
      );

    // Group by user and calculate summaries
    const userStats = new Map<string, UserStatisticsSummaryDto>();

    for (const stat of result) {
      if (!userStats.has(stat.userName)) {
        userStats.set(stat.userName, {
          userName: stat.userName,
          totalChatRequests: 0,
          totalImageRequests: 0,
          totalDaysActive: 0,
          uniqueToolsUsed: [],
        });
      }

      const userStat = userStats.get(stat.userName)!;
      userStat.totalChatRequests += stat.chatRequests;
      userStat.totalImageRequests += stat.imageRequests;
      userStat.totalDaysActive += 1;

      // Merge unique tools
      const existingTools = new Set(userStat.uniqueToolsUsed);
      stat.toolsUsed.forEach((tool) => existingTools.add(tool));
      userStat.uniqueToolsUsed = Array.from(existingTools);
    }

    // Sort users based on the specified criteria
    const sortedUsers = Array.from(userStats.values()).sort((a, b) => {
      switch (sortBy) {
        case 'chatRequests':
          return b.totalChatRequests - a.totalChatRequests;
        case 'imageRequests':
          return b.totalImageRequests - a.totalImageRequests;
        case 'daysActive':
          return b.totalDaysActive - a.totalDaysActive;
        default:
          return b.totalChatRequests - a.totalChatRequests;
      }
    });

    const hasMore = sortedUsers.length > limit;
    const resultUsers = sortedUsers.slice(0, limit);

    return {
      result: resultUsers,
      hasMore,
    };
  }

  private mapToDto(doc: AgentStatisticDocType): StatisticItemDto {
    return {
      userName: doc.userName,
      dateString: doc.dateString,
      chatRequests: doc.chatRequests,
      imageRequests: doc.imageRequests,
      toolsUsed: doc.toolsUsed,
    };
  }
}
