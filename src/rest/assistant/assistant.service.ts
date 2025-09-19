import { Injectable } from '@nestjs/common';
import { RunQueryI, runQuery, getHistory } from '../../assistant';
import { AgentStatisticRepository } from '../../persistance/agent-statistic/agent-statistic.repository';
import { WobjectRepository } from '../../persistance/wobject/wobject.repository';

@Injectable()
export class AssistantService {
  constructor(
    private readonly agentStatisticRepository: AgentStatisticRepository,
    private readonly wobjectRepository: WobjectRepository,
  ) {}

  private getCurrentDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  async writeMessage(params: RunQueryI) {
    const result = await runQuery({
      ...params,
      wobjectRepository: this.wobjectRepository,
    });
    const dateString = this.getCurrentDateString();
    const userName = params.userName || 'unauthorized';

    try {
      // Check if image tools were used
      const imageTools = ['waivioImageTool', 'imageToTextTool'];
      const hasImageTools = result.toolsCalled.some((tool) =>
        imageTools.includes(tool),
      );

      // Update all statistics in a single operation
      await this.agentStatisticRepository.updateStatistics(
        userName,
        dateString,
        result.toolsCalled,
        hasImageTools,
      );
    } catch (error) {
      console.error('Error updating agent statistics:', error);
      // Don't fail the request if statistics update fails
    }

    return { result: result.response };
  }

  async getHistory(id: string) {
    const result = await getHistory({ id });

    return { result };
  }
}
