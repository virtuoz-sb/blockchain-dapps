import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts'
import { getRandomArbitrary } from '../../../common/libs/functions';

function ChartDetail(props : any) {
    const [isInit, setIsInit] = useState<boolean>(false)
    const series = [
        {
          name: "xx",
          data: props.data
        }
      ];
    const data: any = {
        options: {
            chart: {
                id: "basic-bar"
            },
            // title: {
            //     text: 'CandleStick Chart',
            //     align: 'left',
            //     show: false
            // },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                tooltip: {
                    enabled: true
                }
            }
        }
    }

    return (
        <div className="container sample" >
            <ReactApexChart
                key={props.chartType}
                options={data.options}
                series={series}
                type={props.chartType}
                width="100%"
            />
        </div>
    )
}

export default ChartDetail