import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
import {
  AppBeneficiaryType,
  AppBotDocumentType,
  AppCityDocumentType,
  AppColorsDocumentType,
  AppCommissionsDocumentType,
  AppConfigurationDocumentType,
  AppMapPointsDocumentType,
  AppTagsDataDocumentType,
  AppTopUsersDocumentType,
  ChosenPostType,
  ReferralTimersDocumentType,
} from './types';

@Schema({ _id: false })
export class AppTagsData {
  @Prop({ type: Object, default: {} })
  Ingredients: object;
  @Prop({ type: Object, default: {} })
  Cuisine: object;
  @Prop({ type: Object, default: {} })
  'Good For': object;
  @Prop({ type: Object, default: {} })
  Features: object;
}
export const AppTagsDataSchema = SchemaFactory.createForClass(AppTagsData);

@Schema({ _id: false })
export class ReferralTimers {
  @Prop({ type: String })
  type: string;

  @Prop({ type: Number, default: 90 })
  duration: number;
}
export const ReferralTimersSchema =
  SchemaFactory.createForClass(ReferralTimers);

@Schema({ _id: false })
export class AppCommissions {
  @Prop({ type: String, required: true })
  campaigns_server_acc: string;

  @Prop({
    type: Number,
    min: 0,
    max: 1,
    required: true,
  })
  campaigns_percent: number;

  @Prop({ type: String, required: true })
  index_commission_acc: string;

  @Prop({
    type: Number,
    min: 0,
    max: 1,
    required: true,
  })
  index_percent: number;

  @Prop({ type: String, required: true })
  referral_commission_acc: string;
}
export const AppCommissionsSchema =
  SchemaFactory.createForClass(AppCommissions);

@Schema({ _id: false })
export class AppBot {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  postingKey: string;

  @Prop({ type: [String], required: true })
  roles: string;
}
export const AppBotSchema = SchemaFactory.createForClass(AppBot);

@Schema({ _id: false })
export class AppTopUsers {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: Number, default: 0 })
  weight: number;
}
export const AppTopUsersSchema = SchemaFactory.createForClass(AppTopUsers);

@Schema({ _id: false })
export class AppColors {
  @Prop({ type: String })
  background: string;

  @Prop({ type: String, default: '' })
  font: string;

  @Prop({ type: String, default: '' })
  hover: string;

  @Prop({ type: String, default: '' })
  header: string;

  @Prop({ type: String, default: '' })
  button: string;

  @Prop({ type: String, default: '' })
  border: string;

  @Prop({ type: String, default: '' })
  focus: string;

  @Prop({ type: String, default: '' })
  links: string;

  @Prop({ type: String, default: '' })
  mapMarkerBody: string;

  @Prop({ type: String, default: '' })
  mapMarkerText: string;
}
export const AppColorsSchema = SchemaFactory.createForClass(AppColors);

@Schema({ _id: false })
export class AppCity {
  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  route: string;
}
export const AppCitySchema = SchemaFactory.createForClass(AppCity);

@Schema({ _id: false })
export class AppMapPoints {
  @Prop({ type: [Number], required: true })
  topPoint: number[];

  @Prop({ type: [Number], required: true })
  bottomPoint: number[];

  @Prop({ type: [Number], required: true })
  center: number[];

  @Prop({ type: Number, required: true })
  zoom: number;
}
export const AppMapPointsSchema = SchemaFactory.createForClass(AppMapPoints);

@Schema({ _id: false })
export class AppConfiguration {
  @Prop({ type: [String] })
  configurationFields: string[];

  @Prop({ type: String })
  desktopLogo: string;

  @Prop({ type: String })
  mobileLogo: string;

  @Prop({ type: String })
  aboutObject: string;

  @Prop({ type: AppMapPointsSchema })
  desktopMap: AppMapPointsDocumentType;

  @Prop({ type: AppMapPointsSchema })
  mobileMap: AppMapPointsDocumentType;

  @Prop({ type: [AppCitySchema], default: [] })
  availableCities: AppCityDocumentType[];

  @Prop({ type: AppColorsSchema, default: () => ({}) })
  colors: AppColorsDocumentType;

  shopSettings: { type: string; value: string };
}
export const AppConfigurationSchema =
  SchemaFactory.createForClass(AppConfiguration);

@Schema({ timestamps: true })
export class App {
  _id: ObjectId;

  @Prop({ type: String, index: true })
  name: string;

  @Prop({ type: String, required: true })
  owner: string;

  @Prop({ type: String, default: null })
  googleAnalyticsTag: string;

  @Prop({ type: Boolean })
  disableOwnerAuthority: boolean;

  @Prop(
    raw({
      account: { type: String, default: 'waivio' },
      percent: { type: Number, default: 500 },
    }),
  )
  beneficiary: AppBeneficiaryType;

  @Prop({ type: AppConfigurationSchema, default: () => ({}) })
  configuration: AppConfigurationDocumentType;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  host: string;

  @Prop({ type: String })
  mainPage: string;

  @Prop({ type: Types.ObjectId, default: null })
  parent: ObjectId;

  @Prop({ type: [String], default: [] })
  admins: string[];

  @Prop({ type: [String], default: [] })
  authority: string[];

  @Prop({ type: [String], default: [] })
  moderators: string[];

  @Prop({ type: [String], default: [] })
  supported_object_types: string[];

  @Prop({ type: Object, default: {} })
  object_filters: object;

  @Prop({ type: [String], default: [] })
  black_list_users: string[];

  @Prop({ type: [String], default: [] })
  blacklist_apps: string;

  @Prop({ type: [String], default: [] })
  supported_hashtags: string[];

  @Prop({ type: Boolean, default: false })
  canBeExtended: boolean;

  @Prop({ type: Boolean, default: true })
  inherited: boolean;

  @Prop({
    type: String,
  })
  status: string;

  @Prop({ type: Date, default: null })
  activatedAt: Date;

  @Prop({ type: Date, default: null })
  deactivatedAt: Date;

  @Prop({ type: [String], index: true, default: [] })
  supported_objects: string[];

  @Prop({ type: [AppMapPointsSchema], default: [] })
  mapCoordinates: AppMapPointsDocumentType;

  @Prop({ type: [AppTopUsersSchema] })
  top_users: AppTopUsersDocumentType[];

  @Prop(
    raw({
      author: { type: String },
      permlink: { type: String },
      title: { type: String },
    }),
  )
  daily_chosen_post: ChosenPostType;

  @Prop(
    raw({
      author: { type: String },
      permlink: { type: String },
      title: { type: String },
    }),
  )
  weekly_chosen_post: ChosenPostType;

  @Prop({ type: [AppBotSchema], default: [], select: false })
  service_bots: AppBotDocumentType[];

  @Prop({ type: AppCommissionsSchema })
  app_commissions: AppCommissionsDocumentType;

  @Prop({ type: [ReferralTimersSchema], default: [] })
  referralsData: ReferralTimersDocumentType[];

  @Prop({ type: AppTagsDataSchema })
  tagsData: AppTagsDataDocumentType;

  @Prop({
    type: String,
  })
  currency: string;
  @Prop({
    type: String,
  })
  language: string;
  @Prop({ type: [String] })
  prefetches: string[];
}
export const AppSchema = SchemaFactory.createForClass(App);
