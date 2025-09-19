import { Document } from 'mongoose';
import {
  Authority,
  FieldActiveVotes,
  Wobject,
  WobjectFields,
} from '../wobject.schema';

export type MapSchemaType = {
  type: string;
  coordinates: number[];
};

export type WobjectStatusType = {
  title: string;
};

export type WobjectDocumentType = Wobject & Document;

export type WobjectFieldsDocumentType = WobjectFields & Document;

export type FieldActiveVotesDocumentType = FieldActiveVotes & Document;

export type AuthorityDocumentType = Authority & Document;
