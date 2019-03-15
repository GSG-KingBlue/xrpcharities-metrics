import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class ApiService {
    constructor(private app: AppService) {}

    async callTipBotFeedApi(queryParams: string): Promise<any[]> {
        let receivedTips: any[]

        try {
            //console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/feed?"+queryParams)
            let tipbotFeed = await this.app.get("https://xrptipbot-api.siedentopf.xyz/feed?"+queryParams);
            //console.log("feed length: " + tipbotFeed.feed.length);
            receivedTips = tipbotFeed.feed;
        } catch(err) {
            console.log(JSON.stringify(err))
            receivedTips = [];
        }

        return receivedTips;
    }

    async getCount(queryParams: string): Promise<number> {
        let countResult = await this.callTipBotCountApi("", queryParams);

        if(countResult) return countResult.count;
        else return 0;
    }

    async getCountResult(path:string, queryParams: string): Promise<[]> {
        let countResult = await this.callTipBotCountApi(path, queryParams);

        if(countResult) return countResult.result;
        else return [];
    }

    private async callTipBotCountApi(path: string, queryParams: string): Promise<any> {
        try {
            //console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/count"+path+"?"+queryParams)
            return this.app.get("https://xrptipbot-api.siedentopf.xyz/count"+path+"?"+queryParams);
        } catch(err) {
            console.log(JSON.stringify(err))
            return null;
        }
    }

    async getAggregatedXRP(queryParams: string): Promise<number> {
        let aggregateResult = await this.callTipBotAggregateApi("/xrp", queryParams);

        if(aggregateResult) return aggregateResult.xrp;
        else return 0;
    }

    async getAggregatedResult(path:string, queryParams: string): Promise<[]> {
        let aggregateResult = await this.callTipBotAggregateApi(path, queryParams);

        if(aggregateResult) return aggregateResult.result;
        else return [];
    }

    private async callTipBotAggregateApi(path:string, queryParams: string): Promise<any> {
        try {
            //console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/aggregate"+path+"?"+queryParams)
            return this.app.get("https://xrptipbot-api.siedentopf.xyz/aggregate"+path+"?"+queryParams);
        } catch(err) {
            console.log(JSON.stringify(err))
            return null;
        }
    }

    async callTipBotPublicPage(user: string): Promise<any> {
        try {
            return this.app.get('https://www.xrptipbot.com/u:'+user+'/n:twitter/f:json');
        } catch(err) {
            console.log(JSON.stringify(err))
            return [];
        }
    }

    async getUserId(userHandle:string): Promise<string> {
        let userIdResult:any[];
        try {
            userIdResult = await this.callTipBotFeedApi("user="+userHandle+"&limit=1&result_fields=user_id");
            if(userIdResult && userIdResult.length>0)
                return userIdResult[0].user_id;
            else {
                userIdResult = await this.callTipBotFeedApi("to="+userHandle+"&limit=1&result_fields=to_id");
                if(userIdResult && userIdResult.length>0)
                    return userIdResult[0].to_id;
                else return ""
            }
        } catch(err) {
            console.log(err);
            return "";
        }
    }

    async getUserName(userId:string): Promise<string> {
        let userNameResult:any[];
        try {
            userNameResult = await this.callTipBotFeedApi("user_id="+userId+"&limit=1&result_fields=user");
            if(userNameResult && userNameResult.length>0)
                return userNameResult[0].user;
            else {
                userNameResult = await this.callTipBotFeedApi("to_id="+userId+"&limit=1&result_fields=to");
                if(userNameResult && userNameResult.length>0)
                    return userNameResult[0].to;
                else return ""
            }
        } catch(err) {
            console.log(err);
            return "";
        }
    }
}