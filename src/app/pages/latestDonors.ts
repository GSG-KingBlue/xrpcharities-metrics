import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../services/statistics.service';
import * as formatUtil from '../util/formattingUtil';

@Component({
    selector: 'latestDonors',
    templateUrl: 'latestDonors.html'
})

export class LatestDonorsComponent implements OnInit {

    latestDonors:any[] = [];

    constructor(public statistics: StatisticsService) {}
    
    ngOnInit() {
        this.getLatestDonors();

        setInterval(async () => {
            this.getLatestDonors();
        }, 60000);
    }

    async getLatestDonors() {
        this.latestDonors = await this.statistics.getLatestDonors();
    }

    resolveIconName(network:any): string {
        if('discord'===network)
            return 'albert';
        else if('reddit'===network)
            return 'berta'
        else if('coil'===network)
            return 'coil'
        else if('twitter'===network)
            return 'emil'
        else return 'emil';
    }
    
    getNetworkURL(user:string, user_id:string, network: string): String {
        if(network==='discord') {
            return 'https://discordapp.com/u/'+user_id;
        } else if(network ==='reddit') {
            return 'https://reddit.com/u/'+user;
        } else if(network ==='coil') {
            return 'https://coil.com/u/'+user;
        } else {
            return 'https://twitter.com/'+user;
        }
    }

    isDiscordOrCoilNetwork(network:string) {
        return 'discord'===network || 'coil' === network;
    }

    getNetworkURLFrom(data:any) {
        return this.getNetworkURL(data.user, data.user_id, data.user_network);
    }

    getNetworkURLTo(data:any) {
        return this.getNetworkURL(data.to, data.to_id, data.to_network);
    }

    shortenContext(network:string, context: string) {
        if('btn'===network)
            return context.substring(0,context.indexOf(' '));
        else
            return context;
    }

    getIconName(network: string) {
        if('app' === network)
            return 'phonelink_ring';
        else if('btn' === network)
            return 'touch_app';
        else return '';
    }

    formatDate(date:string) {
        return formatUtil.dateToStringEuropeForLocale(formatUtil.initializeStringDateAsGMT2(date));
    }
}
