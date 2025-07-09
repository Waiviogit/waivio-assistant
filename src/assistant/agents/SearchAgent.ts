import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Agent } from './Agent';
import { GraphState } from '../index';
import { generateSearchToolsForHost } from '../tools/waivioSearchTool';

export class SearchAgent implements Agent {
  private llm: ChatOpenAI;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
  }

  async invoke(state: GraphState): Promise<Partial<GraphState>> {
    const { query, host } = state;
    const {
      waivioSearchTool,
      waivioObjectsMapTool,
      waivioOwnerContactTool,
      waivioUserSearchTool,
    } = generateSearchToolsForHost(host);

    const SYSTEM_TEMPLATE = `You are support staff for ${host}.
         Your task is communicate with user and perform search-related tasks to accompany your answers with links and images and additional info to relevant objects, accounts or posts.
         use given tools
         Keep the answer concise. Don't use "AI:" in answers.`;

    const searchLLM = this.llm.bindTools([
      waivioSearchTool,
      waivioObjectsMapTool,
      waivioOwnerContactTool,
      waivioUserSearchTool,
    ]);

    const messages = [
      { role: 'system', content: SYSTEM_TEMPLATE },
      new HumanMessage(query),
    ];

    const supportResponse = await searchLLM.invoke(messages);

    const tools = supportResponse.tool_calls;

    if (!tools?.length) return { response: supportResponse };

    const toolsByName = {
      waivioSearchTool,
      waivioObjectsMapTool,
      waivioOwnerContactTool,
      waivioUserSearchTool,
    };
    messages.push(supportResponse);

    for (const toolCall of tools) {
      const selectedTool =
        toolsByName[toolCall.name as keyof typeof toolsByName];
      const toolMessage = await selectedTool.invoke(toolCall);
      messages.push(toolMessage);
    }

    const response = await searchLLM.invoke(messages);

    return { response };
  }
}
