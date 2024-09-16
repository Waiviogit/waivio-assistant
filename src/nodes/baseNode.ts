import {RunnablePassthrough, RunnableSequence} from "@langchain/core/runnables";
import {formatDocumentsAsString} from "langchain/util/document";
import weaviate from 'weaviate-ts-client'
import {WeaviateStore} from "@langchain/weaviate";
import {OpenAIEmbeddings} from "@langchain/openai";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";
import {StringOutputParser} from "@langchain/core/output_parsers";
import {GraphState} from "../index";


const getVStore = (() => {
    let vStore: WeaviateStore | null = null;

    return async (): Promise<WeaviateStore> => {
        if (vStore) return vStore;

        const client = weaviate.client({
            scheme: 'http',
            host: process.env.WEAVIATE_CONNECTION_STRING ?? '',
        });

        // Create a store for an existing index
        vStore = await WeaviateStore.fromExistingIndex(new OpenAIEmbeddings(), {
            client,
            indexName: process.env.WEAVIATE_ASSISTANT_INDEX ?? '',
            textKey: 'pageContent',
        });

        return vStore;
    };
})();


export async function baseNode(
    state: GraphState
): Promise<Partial<GraphState>> {
    const {llm, query, chatHistory} = state;


    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
        ['system', `Given a chat history and the latest user questionwhich might reference context in the chat history, formulate a standalone questionwhich can be understood without the chat history. Do NOT answer the question,just reformulate it if needed and otherwise return it as is.`],
        new MessagesPlaceholder('chatHistory'),
        ['human', '{query}'],
    ]);

    const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
Whenever possible, accompany your answers with links and images (![image]) to relevant articles or lessons. 
Keep the answer concise. Don't use "AI:" in answers.

{context}`;

    const qaPrompt = ChatPromptTemplate.fromMessages([
        ['system', qaSystemPrompt],
        new MessagesPlaceholder('chatHistory'),
        ['human', '{query}'],
    ]);

    const contextualizeQChain = contextualizeQPrompt
        .pipe(llm)
        .pipe(new StringOutputParser());

    const vectorStore = await getVStore();
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
        chatHistory
    });


    return {
        response: aiMsg
    }
}
