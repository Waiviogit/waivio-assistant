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
import { GraphState } from '../index';
import { getWeaviateStore } from '../store/weaviateStore';
import { configService } from '../../config';
import { createFetchRequest } from '../helpers/createFetchRequest';

type sitesDescriptionType = {
  result: string;
};
const getSiteDescription = async (host: string): Promise<string> => {
  configService.getAppHost();
  const url = `https://${configService.getAppHost()}/api/sites/description`;
  const response = await createFetchRequest({
    api: { method: 'GET', url },
    params: {},
    accessHost: host,
  });

  const { result } = response as sitesDescriptionType;

  return result;
};

export const generalNode = async (
  state: GraphState,
): Promise<Partial<GraphState>> => {
  const { llm, query, chatHistory, nextRepresentative, host } = state;

  const vectorStore = await getWeaviateStore(nextRepresentative);
  const siteDescription = await getSiteDescription(host);

  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question,just reformulate it if needed and otherwise return it as is.`,
    ],
    new MessagesPlaceholder('chatHistory'),
    ['human', '{query}'],
  ]);

  const qaSystemPrompt = `You are an assistant for question-answering tasks on ${host}
    ${siteDescription ? `short description: ${siteDescription}` : ''}
    Use the following pieces of retrieved context to answer the question.
    Whenever possible, accompany your answers with links and images (![image]) to relevant articles or lessons. 
    Keep the answer concise. Don't use "AI:" in answers.
    replace all links to https://social.gifts to https://${host}
    {context}`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    ['system', qaSystemPrompt],
    new MessagesPlaceholder('chatHistory'),
    ['human', '{query}'],
  ]);

  const contextualizeQChain = contextualizeQPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());

  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input) => {
        if ('chatHistory' in input) {
          return contextualizeQChain
            .pipe(vectorStore.asRetriever())
            .pipe(formatDocumentsAsString);
        }
        return '';
      },
    }),
    qaPrompt,
    llm,
  ]);

  const aiMsg = await ragChain.invoke({
    query,
    chatHistory,
  });

  return {
    response: aiMsg,
  };
};
