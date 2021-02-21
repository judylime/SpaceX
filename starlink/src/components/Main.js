import React, {Component} from 'react';
import axios from 'axios';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';
import WorldMap from './WorldMap';
import {NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY} from "../constants";

class Main extends Component {

    constructor(){
        super();
        this.state = {
            satInfo: null,//从n2yo拿回来的sat信息
            setting: null,//前端satSetting拿到的所有数据
            satList: null,//satlist中的selected[]数据
            isLoadingList: false
        };
        //console.log('observerData --> ', setting);
    }

    render() {
        const { isLoadingList, satInfo, satList, setting } = this.state;
        console.log('observerData --> ', setting);
        return (
            /*onShow是前端satsetting拿到的所有数据，在页面上实现一个实时显示。
                    前端用户输入什么，浏览器就拿到什么，前端给用户就显示什么*/
            /*main这边通过n2yo的api拿到的数据，传给孩子SatelliteList，也就是satInfo里*/
            //parent -> child数据传递
            <div className='main'>
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList satInfo={satInfo}
                                   isLoad={isLoadingList}
                                   onShowMap={this.showMap}
                    />
                </div>
                <div className="right-side">
                    <WorldMap satData={satList} observerData={setting} />
                </div>
            </div>
        );
    }

    showMap = (selected) => {
        //也可以this.setState({
        //    satList: selected;
        //})
        this.setState(preState => ({
            ...preState,
            satList: [...selected] //shallow copy
        }))
    }

    showNearbySatellite = (setting) => {
        this.setState({
            isLoadingList: true,
            setting: setting
        })
        this.fetchSatellite(setting);
    }

    fetchSatellite= (setting) => {
        //step 1：解构setting
        const {latitude, longitude, elevation, altitude} = setting;
        //step 2：组建url，创建能够从n2yo沟通&拿数据的api
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        //step 3： show spin and send request当后端拿数据的时候，前端显示loading spin，更好的用户体验
        this.setState({
            isLoadingList: true
        });

        //.get就模拟了method：GET， url："XXXX"
        //模拟了promise异步的动作
        //向后端发起起请求，要数据
        axios.get(url)
            .then(response => {
                console.log("response.data")
                console.log(response.data)
                //当拿到数据以后，停止前端显示loading spin
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                })
            })
            .catch(error => {
                console.log('err in fetch satellite -> ', error);
            })
    }


}

export default Main;
