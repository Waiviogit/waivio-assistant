import {z} from "zod";
import {HumanMessage} from "@langchain/core/messages";
import {GraphState} from "../index";
import {AGENTS, AGENTS_DESCRIPTION} from "../constants/nodes";



const availableAgents = Object.values(AGENTS) as [string, ...string[]]

export const initialSupport = async (state: GraphState): Promise<Partial<GraphState>> => {

    const {llm, query, chatHistory} = state;

    const SYSTEM_TEMPLATE =
        `You are front-line support staff for Waivio.
         Be concise in your responses.
         You can chat with customers and help them with basic questions, but if the customer 
         query connected with ${Object.values(AGENTS_DESCRIPTION).join(',')},
         do not try to answer the question directly or gather information.
         Instead, immediately transfer appropriate  team ${availableAgents.join(',')}.
         Otherwise, just respond conversationally.`;


    const supportResponse = await llm.invoke([
        {role: "system", content: SYSTEM_TEMPLATE},
        ...chatHistory,
        new HumanMessage(query),
    ]);

    const CATEGORIZATION_SYSTEM_TEMPLATE = `You are an expert customer support routing system.
    Your job is to detect whether a customer support representative is routing a user to a ${availableAgents.join(',')}, or if they are just responding conversationally.`;

    const CATEGORIZATION_HUMAN_TEMPLATE =
        `The previous conversation is an interaction between a customer support representative and a user.
         Extract whether the representative is routing the user one of agents, or whether they are just responding conversationally.
    `;

    const schema = z.object({
        nextRepresentative: z.enum(availableAgents)
            .describe(
                ` Extract whether the representative is routing the user one of agents, or whether they are just responding conversationally.
                    Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
                    ${availableAgents.map((a) => {
                           return `If they want to route the user to ${AGENTS_DESCRIPTION[a as keyof typeof AGENTS_DESCRIPTION] }respond only with the word ${a}`
                    }).join('\n')}
                    Otherwise, respond only with the word "RESPOND"
                    `
            ),
    });




    const categorizationResponse = await llm
        .withStructuredOutput(schema)
        .invoke([{
            role: "system",
            content: CATEGORIZATION_SYSTEM_TEMPLATE,
        },
       ...chatHistory,
        new HumanMessage(query),
       {
           role: "user",
           content: CATEGORIZATION_HUMAN_TEMPLATE,
       }]);

    return {
        response: supportResponse,
        nextRepresentative: categorizationResponse.nextRepresentative
    };
};
