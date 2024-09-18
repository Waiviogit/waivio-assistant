import { Injectable, PipeTransform } from '@nestjs/common';
import { configService } from '../config';

type HeadersType = {
  origin?: string;
  referer?: string;
};

const REPLACE_ORIGIN = /(https:\/\/|http:\/\/|www\.)/g;
const REPLACE_REFERER = /(https:\/\/|http:\/\/|www\.|\/.+$|\/)/g;

@Injectable()
export class HostPipe implements PipeTransform {
  transform(headers: HeadersType): string {
    const origin = headers?.origin;
    const referer = headers?.referer;

    let appHost = configService.getAppHost();
    if (origin) appHost = origin.replace(REPLACE_ORIGIN, '');
    if (!origin && referer) appHost = referer.replace(REPLACE_REFERER, '');

    return appHost;
  }
}
