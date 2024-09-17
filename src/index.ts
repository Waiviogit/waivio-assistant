import {END, START, StateGraph} from "@langchain/langgraph";
import {RedisChatMessageHistory} from '@langchain/redis';
import {ChatOpenAI} from "@langchain/openai";
import {BaseMessage} from "@langchain/core/messages";
import {REDIS_KEYS, TTL_TIME} from "./constants/common";
import {initialSupport} from "./nodes/initialNode";
import {generalNode} from "./nodes/generalNode";
import {searchNode} from "./nodes/searchNode";
import {AGENTS} from "./constants/nodes";

export type GraphState = {
    llm: ChatOpenAI;
    query: string;
    chatHistory: BaseMessage[]
    response: BaseMessage,
    nextRepresentative: string
};

const graphChannels = {
    llm: null,
    query: null,
    chatHistory: null,
    response: null,
    nextRepresentative: null
};


const router = (state: GraphState): string => {
    const routes = {
        [AGENTS.UserTools]: "generalNode",
        [AGENTS.ObjectSearch]: "searchNode",
        [AGENTS.CampaignManagement]: "generalNode",
        [AGENTS.EarnCampaign]: "generalNode",
        [AGENTS.ObjectImport]: "generalNode",
        [AGENTS.SitesManagement]: "generalNode",
        [AGENTS.WaivioObjects]: "generalNode",
        [AGENTS.WaivioGeneral]: "generalNode",
        default: "conversational"
    }

    const route = state.nextRepresentative as keyof typeof routes

    return routes[route] || routes.default
}

const routerSettings = Object.freeze({
    generalNode: "generalNode",
    searchNode: "searchNode",
    conversational: END,
})


function createGraph() {

    // add nodes
    const graph = new StateGraph<GraphState>({
        channels: graphChannels,
    })
        .addNode("initialSupport", initialSupport)
        .addNode("generalNode", generalNode)
        .addNode("searchNode", searchNode)

    //add Edges
    graph
        .addEdge(START, "initialSupport")
        .addConditionalEdges("initialSupport", router, routerSettings)
        .addEdge("generalNode", END)
        .addEdge("searchNode", END)


    const app = graph.compile();
    return app;
}


interface runQueryInterface {
    query: string,
    userName: string,
    id: string
}


async function runQuery({query, id}: runQueryInterface): Promise<BaseMessage> {
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


    const result = await app.invoke({
        llm,
        query,
        chatHistory
    })

    console.log("FINAL RESPONSE:",JSON.stringify(result, null, 2))

    // await historyStore.addUserMessage(query);
    // await historyStore.addAIMessage(result.response);


    return result.response;
}

// runQuery({query: 'i want to find info about user "flowmaster"', id: 'ddsdggdfs', userName: 'flowmaster'});


