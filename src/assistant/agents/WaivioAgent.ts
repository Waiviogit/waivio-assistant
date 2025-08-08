import { Agent } from './Agent';
import { ChatOpenAI } from '@langchain/openai';
import { GraphState } from '../index';
import { getSiteVectorTool, getVectorStores } from '../tools/vectorstoreTools';
import { HumanMessage, ToolMessage } from '@langchain/core/messages';
import { checkClassExistByHost } from '../store/weaviateStore';
import { generateSearchToolsForHost } from '../tools/waivioSearchTool';

export class WaivioAgent implements Agent {
  private readonly llm: ChatOpenAI;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
  }

  private async getTools(host: string) {
    const tools = [...(await getVectorStores(this.llm))];

    if (await checkClassExistByHost({ host })) {
      const siteTools = await getSiteVectorTool(host, this.llm);
      if (siteTools.length > 0) tools.push(...siteTools);
    }

    const {
      waivioSearchTool,
      waivioObjectsMapTool,
      waivioOwnerContactTool,
      waivioUserSearchTool,
    } = generateSearchToolsForHost(host);

    tools.push(
      waivioSearchTool,
      waivioObjectsMapTool,
      waivioOwnerContactTool,
      waivioUserSearchTool,
    );

    return tools;
  }

  async invoke(state: GraphState): Promise<Partial<GraphState>> {
    const { query, chatHistory, host, intention } = state;

    try {
      const tools = await this.getTools(host);
      const llmWithTools = this.llm.bindTools(tools);

      const systemPrompt = `You are a Waivio assistant for ${host}. 
      Use the available vector store tools to find relevant information and answer user questions.
      Keep responses helpful and concise. ${intention}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        new HumanMessage(query),
      ];

      const response = await llmWithTools.invoke(messages);

      // Handle tool calls if any
      if (!response?.tool_calls?.length) return { response };

      console.log('Call tools');

      const toolsByName = tools.reduce(
        (acc, tool) => {
          acc[tool.name] = tool;
          return acc;
        },
        {} as Record<string, any>,
      );

      messages.push(response);

      // Execute each tool call
      for (const toolCall of response.tool_calls) {
        const selectedTool = toolsByName[toolCall.name];
        if (selectedTool) {
          const toolResult = await selectedTool.invoke(toolCall.args);
          const toolMessage = new ToolMessage({
            content: toolResult,
            tool_call_id: toolCall.id,
          });
          messages.push(toolMessage);
        }
      }

      // Get final response after tool execution
      const finalResponse = await llmWithTools.invoke(messages);
      return { response: finalResponse };
    } catch (error) {
      console.error('Error in WaivioAgent:', error);

      // Fallback response if vector stores fail
      const fallbackResponse = await this.llm.invoke([
        {
          role: 'system',
          content: `You are a Waivio assistant for ${host}. ${intention}`,
        },
        new HumanMessage(query),
      ]);

      return {
        response: fallbackResponse,
      };
    }
  }
}
