import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class AgentStatistic {
  @Prop({ type: String, required: true })
  userName: string;

  @Prop({ type: String, required: true })
  dateString: string;

  @Prop({ type: Number, required: true, default: 0 })
  chatRequests: number;

  @Prop({ type: Number, required: true, default: 0 })
  imageRequests: number;

  @Prop({ type: [String], required: true, default: [] })
  toolsUsed: string[];
}

export const AgentStatisticSchema =
  SchemaFactory.createForClass(AgentStatistic);

AgentStatisticSchema.index({ userName: 1, dateString: 1 }, { unique: true });
AgentStatisticSchema.index({ userName: 1 });
AgentStatisticSchema.index({ dateString: 1 });
