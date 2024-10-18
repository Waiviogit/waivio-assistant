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
import { ChatOpenAI } from '@langchain/openai';

export const cleanNode = async (
  query: string,
): Promise<Partial<GraphState>> => {
  const INDEX_NAME = 'CleanGirl';
  const vectorStore = await getWeaviateStore(INDEX_NAME);

  const llm = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0,
  });

  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question,just reformulate it if needed and otherwise return it as is.`,
    ],
    new MessagesPlaceholder('chatHistory'),
    ['human', '{query}'],
  ]);

  const qaSystemPrompt = `You are a beauty and care assistant at cleangirllook.com. Use the following context to answer the question
    {context}   Provide helpful tips and include links to relevant products and avatar`;

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
            .pipe(vectorStore.asRetriever({ k: 10 }))
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
    chatHistory: [],
  });

  return {
    response: aiMsg,
  };
};
