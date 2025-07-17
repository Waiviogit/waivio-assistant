import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { Agent } from './Agent';
import { GraphState } from '../index';
import { getIndexFromHostName, getWeaviateStore } from '../store/weaviateStore';
import { getSiteDescription } from '../helpers/requestHelper';
import { z } from 'zod';
import { AGENTS, AGENTS_DESCRIPTION } from '../constants/nodes';
import { HumanMessage } from '@langchain/core/messages';

const availableAgents = Object.values(AGENTS) as [string, ...string[]];

const newAgentsDescription = {
  ...AGENTS_DESCRIPTION,
  ObjectSearch:
    'search  account (user), customer support contacts, contact with owner - ObjectSearch',
};

export class CustomAgent implements Agent {
  private llm: ChatOpenAI;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
  }

  async invoke(state: GraphState): Promise<Partial<GraphState>> {
    const { query, chatHistory, host, intention } = state;
    const vectorStore = await getWeaviateStore(getIndexFromHostName({ host }));
    const siteDescription = await getSiteDescription(host);

    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question,just reformulate it if needed and otherwise return it as is.`,
      ],
      new MessagesPlaceholder('chatHistory'),
      ['human', '{query}'],
    ]);

    const qaSystemPrompt = `You are assistant at ${host},  ${siteDescription ? `short description: ${siteDescription}` : ''}. Use the following context to answer the question
      {context}   Provide helpful tips and include links to relevant products and avatar ${intention}`;

    const qaPrompt = ChatPromptTemplate.fromMessages([
      ['system', qaSystemPrompt],
      new MessagesPlaceholder('chatHistory'),
      ['human', '{query}'],
    ]);

    const contextualizeQChain = contextualizeQPrompt
      .pipe(this.llm)
      .pipe(new StringOutputParser());

    const ragChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: (input) => {
          if ('chatHistory' in input) {
            return contextualizeQChain
              .pipe(vectorStore.asRetriever({ k: 10 }))
              .pipe(formatDocumentsAsString);
          }
          return '';
        },
      }),
      qaPrompt,
      this.llm,
    ]);

    const aiMsg = await ragChain.invoke({
      query,
      chatHistory,
    });

    const CATEGORIZATION_SYSTEM_TEMPLATE = `You are an expert customer support routing system.
    Your job is to detect whether a customer support representative is routing a user to a ${availableAgents.join(
      ',',
    )}, or if they are just responding conversationally.`;

    const CATEGORIZATION_HUMAN_TEMPLATE = `The previous conversation is an interaction between a customer support representative and a user.
         Extract whether the representative is routing the user one of agents, or whether they are just responding conversationally.
    `;

    const schema = z.object({
      nextRepresentative: z.enum([...availableAgents, 'RESPOND']).describe(
        ` Extract whether the representative is routing the user one of agents, or whether they are just responding conversationally.
                    Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
                    ${availableAgents
                      .map((a) => {
                        return `If they want to route the user to ${
                          newAgentsDescription[
                            a as keyof typeof newAgentsDescription
                          ]
                        }respond only with the word ${a}`;
                      })
                      .join('\n')}
                    Otherwise, and also in cases question about specific product, book, person, recipe, business, restaurant respond only with the word "RESPOND"
                    `,
      ),
    });

    const categorizationResponse = await this.llm
      .withStructuredOutput(schema)
      .invoke([
        {
          role: 'system',
          content: CATEGORIZATION_SYSTEM_TEMPLATE,
        },
        new HumanMessage(query),
        {
          role: 'user',
          content: CATEGORIZATION_HUMAN_TEMPLATE,
        },
      ]);

    return {
      response: aiMsg,
      nextRepresentative: categorizationResponse.nextRepresentative,
    };
  }
}
