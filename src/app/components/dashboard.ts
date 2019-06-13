import { Component, OnInit, ViewChild} from "@angular/core";
import { StatisticsService } from '../services/statistics.service';
import { ChartModule } from 'primeng/chart';

interface Charity {
    handle: string;
    id: string;
    startDate?: string;
  }

@Component({
    selector: "dashboard",
    templateUrl: "dashboard.html"
})
export class DashboardComponent implements OnInit {

    @ViewChild ('barChart') barChart: ChartModule;

    @ViewChild ('linesChart') linesChart: ChartModule;

    chartDataBars: any;
    chartDataLines: any;
    optionsBars:any;
    optionsLines:any;
    daysToReceive = 10;
    selectedDayOrWeek: number;
    daysOrWeeksDropDown;
    selectedCharity: Charity;
    availableCharities: Charity[];
    includeDeposits: boolean = false;
    processingBars = false;
    processingLines = false;
    processingAll = false;

    executionTimeout;

    constructor(public statistics: StatisticsService) {
        let currentDate = new Date();
        this.availableCharities = [
            {handle:'GoodXrp', id:'1059563470952247296', startDate: '2019-03-19'},
            {handle:'StJude', id:'9624042'},
            {handle:'WanderingWare', id:'3443786712'},
            {handle:'cranders71', id:'970803226470531072'},
            {handle:'bigbuckor', id:'951179206104403968', startDate: '2018-10-15'},
            {handle:'onemorehome', id:'1080843472129658880'},
            {handle:'cote_uk', id:'21855719'},
        ]
        this.selectedCharity = this.availableCharities[0];

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7}
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;

        this.chartDataBars = {
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
            this.chartDataBars.labels.push(currentDate.toLocaleDateString());
        }

        this.optionsBars = {
            title: {
                display: true,
                text: 'Statistics of ' + this.selectedCharity.handle + ' for last ' + this.daysToReceive + (this.selectedDayOrWeek===1 ? ' Days' : ' Weeks'),
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };

        this.optionsLines = {
            title: {
                display: true,
                text: 'Loading... ',
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };
    }

    async ngOnInit() {
        this.refreshAll();
    }

    refreshSpinner() {
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeout) clearTimeout(this.executionTimeout);
            
            this.executionTimeout = setTimeout(()=> this.refreshBarChart(),500);
        }
    }

    refreshAll() {
        this.processingAll = true;
        
        this.refreshBarChart();
        this.refreshLineChart();

        this.processingAll = false;
    }

    async refreshLineChart() {
        this.processingLines = true;
        
        this.optionsLines = {
            title: {
                display: true,
                text: 'Loading... ',
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };

        this.chartDataLines = null;
        
        let lineData:any = await this.statistics.getChartDataLines(this.selectedCharity);

        let lineDataXRP:number[] = [];
        let lineDataTime:string[] = [];

        let isStart = true;
        for(let keyYear in lineData) {
            let firstMonth = true;
            if(lineData.hasOwnProperty(keyYear) && keyYear != "overall") {
                for(let keyMonth in lineData[keyYear]) {
                    if(lineData[keyYear].hasOwnProperty(keyMonth)) {
                        if(isStart) {
                            lineDataXRP.push(0)
                            if(this.selectedCharity.startDate)
                                lineDataTime.push(this.selectedCharity.startDate);
                            else
                                lineDataTime.push(this.resolveMonth(keyMonth) + " " + keyYear);

                            isStart = false;
                            firstMonth = false;
                        } else if(firstMonth) {
                            lineDataTime.push(this.resolveMonth(keyMonth) + " " + keyYear);
                            firstMonth = false;
                        } else {
                            lineDataTime.push(this.resolveMonth(keyMonth));
                        }

                        lineDataXRP.push(lineData[keyYear][keyMonth])
                    }
                }
            }
        }

        let raised = await this.statistics.calculateBalances(this.selectedCharity);
        lineDataXRP[lineDataXRP.length-1] = raised[1];

        lineDataTime.push("Now");

        this.chartDataLines = {
            labels: lineDataTime,
            datasets: [
                {
                    label: 'Received XRP',
                    data: lineDataXRP,
                    fill: true,
                    borderColor: '#1E88E5'
                }
            ]
        }

        this.optionsLines = {
            title: {
                display: true,
                text: 'Overall received XRP for ' + this.selectedCharity.handle,
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };

        this.processingLines = false;
    }

    async refreshBarChart() {
        this.processingBars=true;
        //console.log("DropDownSelection: " + this.selectedDayOrWeek);

        let result:any = await this.statistics.getChartDataBars(this.daysToReceive, this.selectedDayOrWeek, false, false, true, true, this.includeDeposits, this.includeDeposits, this.selectedCharity.id);


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
    
        this.chartDataBars = {
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

        this.optionsBars = {
            title: {
                display: true,
                text: 'Statistics of ' + this.selectedCharity.handle + ' for last ' + (dataSet[2].length) + (this.selectedDayOrWeek===1 ? ' Days' : ' Weeks'),
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };

        this.processingBars=false;
    }

    resolveMonth(month:any) {
        switch(month) {
            case "0": return "January";
            case "1": return "February";
            case "2": return "March";
            case "3": return "April";
            case "4": return "May";
            case "5": return "June";
            case "6": return "July";
            case "7": return "August";
            case "8": return "September";
            case "9": return "October";
            case "10": return "November";
            case "11": return "December";
        }
    }
}
