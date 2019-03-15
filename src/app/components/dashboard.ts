import { Component, OnInit, ViewChild} from "@angular/core";
import { StatisticsService } from '../services/statistics.service';
import { ChartModule } from 'primeng/chart';

interface Charity {
    label: string;
    value: string;
  }

@Component({
    selector: "dashboard",
    templateUrl: "dashboard.html"
})
export class DashboardComponent implements OnInit {

    @ViewChild ('barChart') chart: ChartModule;

    chartData: any;
    options:any;
    daysToReceive = 10;
    selectedDayOrWeek: number;
    daysOrWeeksDropDown;
    selectedCharity: Charity;
    availableCharities: Charity[];
    includeDeposits: boolean = false;
    processing = false;

    executionTimeout;

    constructor(public statistics: StatisticsService) {
        let currentDate = new Date();
        this.availableCharities = [
            {label:'xrpcharities', value:'1082115799840632832'},
            {label:'StJude', value:'9624042'},
            {label:'WanderingWare', value:'3443786712'},
            {label:'cranders71', value:'970803226470531072'},
            {label:'bigbuckor', value:'951179206104403968'},
            {label:'onemorehome', value:'1080843472129658880'},
            {label:'cote_uk', value:'21855719'},
            {label:'GoodXrp', value:'1059563470952247296'},
        ]
        this.selectedCharity = this.availableCharities[0];

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7}
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;

        this.chartData = {
        labels: [],
        datasets: [
            {
                label: 'Received XRP',
                data: [0,0,0,0,0,0,0,0,0,0,100]
            },
            {
                label: 'Received Tips',
                data: [0,0,0,0,0,0,0,0,0,0,100]
            },
            ]
        }

        for(let i=9;i>=0;i--) {
            currentDate.setDate(new Date().getDate()-(i*this.selectedDayOrWeek));
            this.chartData.labels.push(currentDate.toLocaleDateString());
        }

        this.options = {
            title: {
                display: true,
                text: 'Statistics for last 10 Days',
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };
    }

    async ngOnInit() {
        this.refresh();
    }

    refreshSpinner() {
        if(Number.isInteger(this.daysToReceive)) {
            console.log("spinner: " + this.daysToReceive)
            if(this.executionTimeout) clearTimeout(this.executionTimeout);
            
            this.executionTimeout = setTimeout(()=> this.refresh(),500);
        }
    }

    async refresh() {
        this.processing=true;
        console.log("include deposits? " + this.includeDeposits);
        console.log("selectedCharity: " + JSON.stringify(this.selectedCharity));
        //console.log("DropDownSelection: " + this.selectedDayOrWeek);
        let result:any = await this.statistics.getChartData(this.daysToReceive, this.selectedDayOrWeek, false, false, true, true, this.includeDeposits, this.includeDeposits, this.selectedCharity.value);

        if(this.includeDeposits) {
            for(let i = 0;i<result.receivedTips.length;i++)
                result.receivedTips[i]+= result.directDepositsCount[i];

            for(let i = 0;i<result.receivedXRP.length;i++)
                result.receivedXRP[i] = (result.receivedXRP[i]*1000000+result.directDepositsXRP[i]*1000000)/1000000;
        }

        let dataSet:any[]=[];
        dataSet.push(result.receivedXRP.reverse());
        dataSet.push(result.receivedTips.reverse());
        dataSet.push(result.dateTimes.reverse())
        //console.log("dataSet received:" + JSON.stringify(dataSet));
        dataSet[0].push(0); //hidden value of 0 to always force the chart to start at 0 on y axis
        dataSet[1].push(0); //hidden value of 0 to always force the chart to start at 0 on y axis
        
        let labelsX = [];

        dataSet[2].forEach(jsonDate => {
            let from = new Date(jsonDate.from);
            let to = new Date(jsonDate.to);

            if(this.selectedDayOrWeek==1)
                labelsX.push(to.getUTCDate()+"."+(to.getUTCMonth()+1)+"."+to.getUTCFullYear());
            else
                labelsX.push(from.getUTCDate()+"."+(from.getUTCMonth()+1)+"."+from.getUTCFullYear() + " - \n" + to.getUTCDate()+"."+(to.getUTCMonth()+1)+"."+to.getUTCFullYear());
        })
    
        this.chartData = {
          labels: labelsX,
          datasets: [
              {
                  label: 'Received XRP',
                  data: dataSet[0],
                  backgroundColor: '#42A5F5',
                  borderColor: '#1E88E5',
              },
              {
                label: 'Received Tips',
                data: dataSet[1],
                backgroundColor: '#9CCC65',
                borderColor: '#7CB342',
              },
            ]
        }

        this.options = {
            title: {
                display: true,
                text: 'Statistics of ' + this.selectedCharity.label + ' for last ' + (dataSet[2].length) + (this.selectedDayOrWeek===1 ? ' Days' : ' Weeks'),
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };

        this.processing=false;
    }
}
