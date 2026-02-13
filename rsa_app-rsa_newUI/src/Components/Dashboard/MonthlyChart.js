import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";

const MonthlyChart = (props) => {
    const [state, setState] = React.useState({
      
        series: [{
          name: 'Assigned',
          data: props.a?props.a:[0,0,0,0,0,0,0,0,0,0,0,0]
        }, {
          name: 'Completed',
          data: props.c?props.c:[0,0,0,0,0,0,0,0,0,0,0,0,]
        }],
        options: {
          chart: {
            type: 'bar',
            height: 200,
            stacked: true,
            toolbar: {
              show: true
            },
            zoom: {
              enabled: true
            }
          },
          responsive: [{
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0
              }
            }
          }],
          plotOptions: {
            bar: {
              horizontal: false,
              borderRadius: 10,
              borderRadiusApplication: 'end', // 'around', 'end'
              borderRadiusWhenStacked: 'last', // 'all', 'last'
              dataLabels: {
                total: {
                  enabled: true,
                  style: {
                    fontSize: '13px',
                    fontWeight: 900
                  }
                }
              }
            },
          },
          xaxis: {
            type: 'year',
            categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
            ],
          },
          legend: {
            position: 'right',
            offsetY: 40
          },
          fill: {
            opacity: 1
          }
        },
      
      
    });    

    return (
        <ReactApexChart options={state.options} 
        series={state.series} type="bar" height={200} />
    );
    }

export default MonthlyChart;