import React, {Component} from 'react';
import { feature } from 'topojson-client';
import axios from 'axios';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { Spin } from "antd";
import {
    WORLD_MAP_URL,
    SATELLITE_POSITION_URL,
    SAT_API_KEY
} from "../constants";


const width = 960;//为了前端最后返回的地图大小
const height = 600;

class WorldMap extends Component {
    constructor(){
        super();
        this.state = {
            isLoading: false,
            isDrawing: false
        };
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.refMap = React.createRef();//拿到react当中的dom树，也就是render()中的<div>
        this.refTrack = React.createRef();
    }

    //在did mount进程中进行地图的显示
    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                const { data } = res;
                //topojson.feature（topology，object） => 返回GeoJSON格式
                //topology里面包含很多：config,data，objects，objects.countries等等
                //最后的".features"是拿到坐标，即land里面存储坐标。后面再通过geoKavrayskiy7来画图
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);//画出国家和经纬度的图
            })
            .catch(e => console.log('err in fecth world map data ', e))
    }

    //由于在画国家和经纬度的时候已经完成了did mount的过程，所以在实现卫星的实时动态链的时候
    //&& 当satsetting和satelitelist传数据的时候只能通过componentDidUpdate
    //但是要注意设置condition，防止死循环render
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData !== this.props.satData) {//设定condition停止机制，防止死循环
            //step 1: get setting and select satlist
            const {
                latitude,
                longitude,
                elevation,
                altitude,
                duration
            } = this.props.observerData;//sat setting的数据，用户输入数据的解构
            const endTime = duration * 60;//加速卫星移动速度，不然在地图上显示太慢

            this.setState({
                isLoading: true
            });

            //step 2: prepare for url-> 准备一个url发送给n2yo去拿卫星实时动态的数据
            //performing multiple concurrent request发送多个并发的请求
            // -返回类型是axios.get(url)，所以要注意这里的返回类型
            const urls = this.props.satData.map(sat => {
                const { satid } = sat;//解构satlist中的数据，拿出其中的sat id
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;

                return axios.get(url);
            });

            //step 3: parse sat position data异步的去发送这些urls取得卫星轨迹坐标
            Promise.all(urls)
                .then(res => {
                    console.log('result ->', res);
                    const arr = res.map(sat => sat.data);//把拿回来的数据res进行map？？？
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    });

                    //step 3: track
                    if (!prevState.isDrawing) {
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones!";
                    }
                })
                .catch(e => {
                    console.log("err in fetch satellite position -> ", e.message);
                });
        }
    }

    //通过用户checkbox的选择[]来解构&&异步发送urls拿到卫星实时坐标，进行追踪
    track = data => {
        if (!data[0].hasOwnProperty("positions")) {
            throw new Error("no position data");
            return;
        }
        console.log('卫星的数据data -> ', data);
        console.log('data[0] -> ', data[0]);
        console.log('data[0].positions -> ', data[0].positions);
        console.log('data[0].positions.length -> ', data[0].positions.length);

        const len = data[0].positions.length;//一共有多少数据，1颗卫星的positions--->600--> 前端用户给的
        const { duration } = this.props.observerData;
        const { context2 } = this.map;

        let now = new Date();//初始时间，第一个点

        let i = 0;//记录当前有多少数据，第几个点

        //每隔1000ns，也就是1s做什么
        let timer = setInterval(() => {
            let ct = new Date();//当前时间current time

            let timePassed = i === 0 ? 0 : ct - now;//时间流逝了多少
            let time = new Date(now.getTime() + 60 * timePassed);//时间的加速60倍,前端页面上的时间是1s1s的在跳转

            //drawing track
            //context2是卫星实时动态的画板，这里注意要和国家&&经纬度的画板match，通过css文件的absolute方法
            context2.clearRect(0, 0, width, height);

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);//跟在卫星实时动态的画布上，填上实时时间

            if (i >= len) {//当卫星画够了，停止
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            //每个卫星打点
            data.forEach(sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i]);
            });

            i += 60;
        }, 1000);
    };

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlongitude || !satlatitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        const { projection, context2 } = this.map;
        const xy = projection([satlongitude, satlatitude]);//卫星实时坐标相对于经纬度的图上的位置？？

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);//坐标的坐标，半径，起始角度
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
    };

    render() {
        const { isLoading } = this.state;
        return (
            <div className="map-box">
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large" />
                    </div>
                ) : null}
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
                <div className="hint" />
            </div>
        );
    }

    //画出国家和经纬度的图
    //通过land坐标array[]来画图，通过'd3-geo-projection'的geoKavrayskiy7()方法
    generateMap(land){
        const projection = geoKavrayskiy7()//投影仪的工具
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);//精度

        const graticule = geoGraticule();//d3-geo的方法，经纬度的工具

        //find DOM- map position
        const canvas = d3Select(this.refMap.current)//d3-selection的方法
            .attr("width", width)
            .attr("height", height);

        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        //通过canvas的node()接口来设置画布内容的维度
        let context = canvas.node().getContext("2d");
        let context2 = canvas2.node().getContext("2d");

        //geoPath()负责画出边（各个国家之间的边）
        let path = geoPath()//d3-geo的方法
            .projection(projection)//投影仪
            .context(context);//画布内容

        //对于坐标元素land array中的每个元素，
        land.forEach(ele => {                       //-------------先画国家信息
            context.fillStyle = '#B3DDEF';//国家的底色-淡蓝色
            context.strokeStyle = '#000';//画笔颜色
            context.globalAlpha = 0.7;//国家的模糊度
            context.beginPath();//准备开始画路径
            path(ele);//开始画画，代入坐标参数
            context.fill();//填满画布内容
            context.stroke();//用画笔画
                                                    //------------再画经纬度
            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';//经纬度横竖条的颜色
            context.beginPath();//画布上开始作画
            path(graticule());//画上经纬度信息
            context.lineWidth = 0.1;//经纬度线条的粗细
            context.stroke();

                                                 //------------最后再画经纬度的上下边界
            context.beginPath();
            context.lineWidth = 0.5;//经纬度边界线的画笔粗细
            path(graticule.outline());//画上上下边界
            context.stroke();
        });

         this.map = {
             projection: projection,
             graticule: graticule,
             context: context,
             context2: context2
         };
    };
}

export default WorldMap;
