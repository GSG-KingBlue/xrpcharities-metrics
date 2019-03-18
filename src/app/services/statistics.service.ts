import { Injectable } from '@angular/core';
import { ApiService } from './api.service'

@Injectable()
export class StatisticsService {

    constructor(private api: ApiService) {}

    async calculateBalances(charity:any): Promise<any[]> {
        try {
            let tipbotFeed = await this.api.callTipBotPublicPage(charity.handle);
            let xrpDeposited = await this.api.getAggregatedXRP("user_id="+charity.id+"&type=deposit");
            let stats = tipbotFeed.stats;
            let xrpRaised = 0;
            let currentBalance = 0;
            //exclude @xrpcharities bot from the list but keep the amount which was raised until it got abandoned.
            if(charity.id == '1082115799840632832') {
                xrpRaised = 4410.100723
            }
            //normal calculation for all other charities and bots
            else {
                xrpRaised = (stats.tips.received.amount*1000000 + xrpDeposited*1000000 + stats.donations.ilpDeposits.amount*1000000)/1000000;
                //deduct 1089.75 XRP from bigbuckor -> these are donations regarding his blog before he started the charity
                if(charity.id==='951179206104403968')
                    xrpRaised = xrpRaised-1089.75;

                currentBalance = tipbotFeed.stats.balance.amount;
            }

            return [tipbotFeed.stats.balance.amount,currentBalance > xrpRaised ? currentBalance : xrpRaised];
        } catch {
            return [0,0];
        }
    }

    async getChartData(days:number, multiplier: number,
        getSentTips:boolean,
        getSentXRP:boolean,
        getReceivedTips:boolean,
        getReceivedXRP:boolean,
        getDepositsCount: boolean,
        getDepositsXRP: boolean, userId?: string): Promise<any> {

        let result:any = {
            sentTips: [],
            sentXRP: [],
            receivedTips: [],
            receivedXRP: [],
            directDepositsCount: [],
            directDepositsXRP: [],
            dateTimes: []
        };

        let sentTips:any[] = [];
        let sentXRP:any[] = [];
        let receivedTips:any[] = [];
        let receivedXRP:any[] = [];
        let directDepositsCount:any[] = [];
        let directDepositsXRP:any[] = [];
        let dateTimes:any[] = [];

        let upperDate = new Date();
        let nextLowDate = new Date();
        let lowestDate = new Date();
        //next low day should be last monday if we calculate weeks
        let daysToMonday = nextLowDate.getDay()-1;
        if(multiplier==7) {
            nextLowDate.setDate(nextLowDate.getDate() - daysToMonday);
            lowestDate.setDate(lowestDate.getDate() - daysToMonday);
        }
        
        nextLowDate = this.setZeroTime(nextLowDate);   

        //determine the lowest date to check for
        lowestDate.setDate(lowestDate.getDate() - (days-1)*multiplier);
        lowestDate = this.setZeroTime(lowestDate);

        while(nextLowDate >= lowestDate) {
            if(getSentTips)
                sentTips.push(this.getSentTips(nextLowDate, upperDate, userId));
            if(getSentXRP)
                sentXRP.push(this.getSentXRP(nextLowDate, upperDate, userId));
            if(getReceivedTips)
                receivedTips.push(this.getReceivedTips(nextLowDate, upperDate, userId));
            if(getReceivedXRP)
                receivedXRP.push(this.getReceivedXRP(nextLowDate, upperDate, userId));
            if(getDepositsCount)
                directDepositsCount.push(this.getDepositCount(nextLowDate, upperDate, userId));
            if(getDepositsXRP)
                directDepositsXRP.push(this.getDepositXRP(nextLowDate, upperDate, userId));

            dateTimes.push({from: nextLowDate.toUTCString(), to: upperDate.toUTCString()})

            upperDate = new Date(nextLowDate.toUTCString());
            upperDate.setDate(upperDate.getDate()-1)
            upperDate = this.setHigherTime(upperDate);

            nextLowDate.setDate(nextLowDate.getDate()-multiplier);
            nextLowDate = this.setZeroTime(nextLowDate);
        }

        result.sentTips = await Promise.all(sentTips);
        result.sentXRP = this.roundToSixDecimals(await Promise.all(sentXRP));
        result.receivedTips = await Promise.all(receivedTips);
        result.receivedXRP = this.roundToSixDecimals(await Promise.all(receivedXRP));
        result.directDepositsCount = await Promise.all(directDepositsCount);
        result.directDepositsXRP = this.roundToSixDecimals(await Promise.all(directDepositsXRP));
        result.dateTimes = dateTimes;

        return result;
    }

    async getSentTips(fromDate: Date, toDate:Date, userId?): Promise<any> {
        return this.api.getCount("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+(userId?"&user_id="+userId:""));
    }

    async getSentXRP(fromDate: Date, toDate:Date, userId?): Promise<any> {
        return this.api.getAggregatedXRP("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+(userId?"&user_id="+userId:""));
    }

    async getReceivedTips(fromDate: Date, toDate:Date, userId?): Promise<any> {
        return this.api.getCount("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+(userId?"&to_id="+userId:""));
    }

    async getReceivedXRP(fromDate: Date, toDate:Date, userId?): Promise<any> {
        return this.api.getAggregatedXRP("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+(userId?"&to_id="+userId:""));
    }

    async getDepositCount(fromDate: Date, toDate:Date, userId?): Promise<any> {
        return this.api.getCount("type=deposit&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+(userId?"&user_id="+userId:""));
    }

    async getDepositXRP(fromDate: Date, toDate:Date, userId?): Promise<any> {
        return this.api.getAggregatedXRP("type=deposit&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+(userId?"&user_id="+userId:""));
    }

    private roundToSixDecimals(array:any[]): any[] {
        for(let i = 0; i < array.length;i++)
        array[i] = Number(array[i].toFixed(6));

        return array;
    }

    setZeroMilliseconds(dateToModify: Date): Date {
        dateToModify.setUTCMilliseconds(0);
        return dateToModify
    }

    setHighMilliseconds(dateToModify: Date): Date {
        dateToModify.setUTCMilliseconds(999);
        return dateToModify
    }

    setZeroTime(dateToModify: Date): Date {
        dateToModify.setUTCHours(0);
        dateToModify.setUTCMinutes(0);
        dateToModify.setUTCSeconds(0);
        dateToModify = this.setZeroMilliseconds(dateToModify);

        return dateToModify;
    }
    
    setHigherTime(dateToModify: Date): Date {
        dateToModify.setUTCHours(23);
        dateToModify.setUTCMinutes(59);
        dateToModify.setUTCSeconds(59);
        dateToModify = this.setHighMilliseconds(dateToModify);

        return dateToModify;
    }
}