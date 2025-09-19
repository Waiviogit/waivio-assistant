import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class AgentQA {
  @Prop({ type: String, required: true })
  question: string;

  @Prop({ type: String, required: true })
  answer: string;

  @Prop({ type: String, required: true })
  topic: string;
}

export const AgentQASchema = SchemaFactory.createForClass(AgentQA);

AgentQASchema.index({ question: 1, answer: 1 }, { unique: true });
AgentQASchema.index({ topic: 1 });
