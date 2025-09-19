import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
import {
  AuthorityDocumentType,
  FieldActiveVotesDocumentType,
  MapSchemaType,
  WobjectFieldsDocumentType,
  WobjectStatusType,
} from './types';

@Schema({ _id: false })
export class Authority {
  @Prop({ type: [String], default: [] })
  administrative: string[];
  @Prop({ type: [String], default: [] })
  ownership: string[];
}
export const AuthoritySchema = SchemaFactory.createForClass(Authority);

@Schema({ _id: false })
export class FieldActiveVotes {
  @Prop({ type: String })
  voter: string;
  @Prop({ type: Number })
  weight: number;
  @Prop({ type: Number })
  percent: number;
  @Prop({ type: Number })
  rshares_weight: number;
}

export const FieldActiveVotesSchema =
  SchemaFactory.createForClass(FieldActiveVotes);

@Schema({ _id: false })
export class WobjectFields {
  @Prop({ type: String, index: true })
  name: string;

  @Prop({ type: String })
  body: string;

  @Prop({ type: Number, default: 1 })
  weight: number;

  @Prop({ type: String, default: 'en-US' })
  locale: string;

  @Prop({ type: String })
  creator: string;

  @Prop({ type: String })
  author: string;

  @Prop({ type: String })
  permlink: string;
  @Prop({ type: [FieldActiveVotesSchema], default: [] })
  active_votes: FieldActiveVotesDocumentType[];
}

export const WobjectFieldsSchema = SchemaFactory.createForClass(WobjectFields);

@Schema()
export class Wobject {
  _id: ObjectId;

  @Prop({ type: String })
  app: string;

  @Prop({ type: String })
  community: string;

  @Prop({ type: String })
  object_type: string;

  @Prop({ type: String, required: true })
  default_name: string;

  @Prop({ type: Boolean, default: true })
  is_posting_open: boolean;

  @Prop({ type: Boolean, default: true })
  is_extending_open: boolean;

  @Prop({ type: String, required: true })
  creator: string;

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: AuthoritySchema, default: () => ({}) })
  authority: AuthorityDocumentType;

  @Prop({ type: String, index: true, unique: true, required: true })
  author_permlink: string;

  @Prop({ type: Number, default: 1 })
  weight: number;

  @Prop({ type: String, default: '' })
  parent: string;

  @Prop({ type: [String], default: [] })
  children: string[];

  @Prop({ type: [WobjectFieldsSchema], default: [] })
  fields: WobjectFieldsDocumentType[];

  @Prop(
    raw({
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    }),
  )
  map: MapSchemaType;

  @Prop({ type: [Types.ObjectId] })
  activeCampaigns: ObjectId[];

  @Prop({ type: Number, default: 0 })
  activeCampaignsCount: number;

  @Prop(
    raw({
      title: { type: String },
    }),
  )
  status?: WobjectStatusType;
}

export const WobjectSchema = SchemaFactory.createForClass(Wobject);
