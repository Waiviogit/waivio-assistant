import { END, START, StateGraph } from "@langchain/langgraph";
import { RedisChatMessageHistory } from '@langchain/redis';
import { ChatOpenAI } from "@langchain/openai";
import {BaseMessage} from "@langchain/core/messages";
import {REDIS_KEYS, TTL_TIME} from "./constants/common";
import {baseNode} from "./nodes/baseNode";

export type GraphState = {
    llm: ChatOpenAI;
    query: string;
    chatHistory: BaseMessage[]
    response: BaseMessage
};

const graphChannels = {
    llm: null,
    query: null,
    chatHistory: null,
    response: null
};


function createGraph() {

    // add nodes
    const graph = new StateGraph<GraphState>({
        channels: graphChannels,
    })
        .addNode("baseNode", baseNode);

    //add Edges
    graph
        .addEdge(START, "baseNode")
        .addEdge("baseNode", END);


    const app = graph.compile();
    return app;
}




interface runQueryInterface  {
    query: string,
    userName:string,
    id: string
}



async function runQuery({query, id}:runQueryInterface) {



    const app = createGraph();

    const llm = new ChatOpenAI({
        modelName: "gpt-4o",
        temperature: 0,
    });

    const historyStore = new RedisChatMessageHistory({
        sessionId: `${REDIS_KEYS.API_RES_CACHE}:${REDIS_KEYS.ASSISTANT}:${id}`,
        sessionTTL: TTL_TIME.TEN_MINUTES,
        config: {
            url: process.env.REDIS_URL ?? 'redis://localhost:6379',
        },
    });

    const chatHistory = await historyStore.getMessages();

    // const stream = await app.stream({
    //     llm,
    //     query,
    //     chatHistory
    // });

    // let finalResult: GraphState | null = null;
    // for await (const event of stream) {
    //     console.log("\n------\n");
    //     if (Object.keys(event)[0] === "execute_request_node") {
    //         console.log("---FINISHED---");
    //         finalResult = event.execute_request_node;
    //     } else {
    //         console.log("Stream event: ", Object.keys(event)[0]);
    //         // Uncomment the line below to see the values of the event.
    //         // console.log("Value(s): ", Object.values(event)[0]);
    //     }
    // }


    const response = await app.invoke({
        llm,
        query,
        chatHistory
    })

    console.log(JSON.stringify(response, null, 2))

    // await historyStore.addUserMessage(question);
    // await historyStore.addAIMessage(aiMsg);

}

runQuery({query: 'what is waivio', id: '1', userName: 'flowmaster'});
