import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import {
  StatisticsResponseDto,
  UserStatisticsSummaryDto,
  DateStatisticsSummaryDto,
  DateRangeStatisticsSummaryDto,
  TopUsersResponseDto,
} from '../../dto/statistics-out.dto';
import { StatisticsControllerDoc } from './statistics.controller.doc';
import { AuthGuard, AdminGuard } from '../../guards';

@Controller('statistics')
@StatisticsControllerDoc.main()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('user/:userName')
  @UseGuards(AuthGuard, AdminGuard)
  @StatisticsControllerDoc.getStatisticsByUser()
  async getStatisticsByUser(
    @Param('userName') userName: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ): Promise<StatisticsResponseDto> {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (isNaN(skipNum) || skipNum < 0) {
      throw new HttpException('Invalid skip parameter', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      throw new HttpException(
        'Invalid limit parameter (must be between 1 and 100)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.statisticsService.getStatisticsByUser(
      userName,
      skipNum,
      limitNum,
    );
  }

  @Get('user/:userName/summary')
  @UseGuards(AuthGuard, AdminGuard)
  @StatisticsControllerDoc.getUserSummary()
  async getUserSummary(
    @Param('userName') userName: string,
  ): Promise<UserStatisticsSummaryDto> {
    return this.statisticsService.getUserSummary(userName);
  }

  @Get('date/:dateString')
  @UseGuards(AuthGuard, AdminGuard)
  @StatisticsControllerDoc.getDateSummary()
  async getDateSummary(
    @Param('dateString') dateString: string,
  ): Promise<DateStatisticsSummaryDto> {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      throw new HttpException(
        'Invalid date format. Use YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.statisticsService.getDateSummary(dateString);
  }

  @Get('date-range')
  @UseGuards(AuthGuard, AdminGuard)
  @StatisticsControllerDoc.getDateRangeSummary()
  async getDateRangeSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DateRangeStatisticsSummaryDto> {
    if (!startDate || !endDate) {
      throw new HttpException(
        'Both startDate and endDate are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new HttpException(
        'Invalid date format. Use YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate that startDate is before or equal to endDate
    if (startDate > endDate) {
      throw new HttpException(
        'startDate must be before or equal to endDate',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.statisticsService.getDateRangeSummary(startDate, endDate);
  }

  @Get('date-range/detailed')
  @UseGuards(AuthGuard, AdminGuard)
  @StatisticsControllerDoc.getStatisticsByDateRange()
  async getStatisticsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ): Promise<StatisticsResponseDto> {
    if (!startDate || !endDate) {
      throw new HttpException(
        'Both startDate and endDate are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const skipNum = skip ? parseInt(skip, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (isNaN(skipNum) || skipNum < 0) {
      throw new HttpException('Invalid skip parameter', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      throw new HttpException(
        'Invalid limit parameter (must be between 1 and 100)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new HttpException(
        'Invalid date format. Use YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate that startDate is before or equal to endDate
    if (startDate > endDate) {
      throw new HttpException(
        'startDate must be before or equal to endDate',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.statisticsService.getStatisticsByDateRange(
      startDate,
      endDate,
      skipNum,
      limitNum,
    );
  }

  @Get('top-users')
  @UseGuards(AuthGuard, AdminGuard)
  @StatisticsControllerDoc.getTopUsers()
  async getTopUsers(
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'chatRequests' | 'imageRequests' | 'daysActive',
  ): Promise<TopUsersResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      throw new HttpException(
        'Invalid limit parameter (must be between 1 and 100)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validSortOptions = ['chatRequests', 'imageRequests', 'daysActive'];
    const sortByParam = sortBy || 'chatRequests';

    if (!validSortOptions.includes(sortByParam)) {
      throw new HttpException(
        'Invalid sortBy parameter. Must be one of: chatRequests, imageRequests, daysActive',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.statisticsService.getTopUsers(
      limitNum,
      sortByParam as 'chatRequests' | 'imageRequests' | 'daysActive',
    );
  }
}
