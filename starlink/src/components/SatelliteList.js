import React, {Component} from 'react';
import { List, Avatar, Button, Checkbox, Spin } from 'antd';
import satellite from "../assets/images/Satelite.svg";

class SatelliteList extends Component {
    state = {
        selected: []//记录前端用户选择了哪些卫星
    }


    render() {
        const { isLoad } = this.props;
        //检查传进来的sat info是否==null，如果是空则[]，以防止后面解构dataSource的时候必须是array的形式冲突
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const { selected } = this.state;

        return (
            //"{}"代表要插入值（在前端），如果isLoad是true就显示spin（loading小图标）
            <div className="sat-list-box">
                <div>
                    <Button className="sat-list-btn"
                            size="large"
                            disabled={ selected.length === 0}
                            onClick={this.onShowSatMap}
                    >Track on the map</Button>

                </div>

                <hr/>

                {
                    isLoad
                    ?
                        <div className="spin-box">
                            <Spin size="large" tip="Loading..."/>
                        </div>
                        :
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            size="small"
                            //dataSource和renderItem都是api方法。使用这样的方式模拟"<li>"
                            //平时是使用<UL><LI></LI></UL>的形式
                            //这里是用了renderItem把里面的每一个element用<List.Item>的格式展现
                            dataSource={satList}//后端n2yo返回的是一个array，里面有很多item信息
                            renderItem={item => (

                                <List.Item
                                    //Checkbox是受控组件, 自己加了一个dataInfo field，为了拿到前端用户check的box信息
                                    actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                >
                                    <List.Item.Meta
                                        //avatar：头像
                                        avatar={<Avatar size={50} src={satellite} />}
                                        title={<p>{item.satname}</p>}
                                        description={`Launch Date: ${item.launchDate}`}
                                    />

                                </List.Item>
                            )}
                        />
                }
            </div>
        );
    }

    onShowSatMap = () => {
        const { selected } = this.state;
        this.props.onShowMap(selected);
    }

    onChange = e => {
        console.log("clicked->", e.target)
        const { checked, dataInfo } = e.target;
        //目前都选择了哪些卫星的array
        const { selected } = this.state;
        //add or remove selected satellite to/from the satlist
        const list = this.addOrRemove(dataInfo, checked, selected);//修改以后的：目前都选择了哪些卫星的array
        this.setState({ selected: list });
    }

    addOrRemove = (sat, status, list) => {
        //case 1: check is true
        // -> sat not list -> add it!!!!
        // -> sat is in the list already -> do nothing

        //case 2: check is false
        // -> sat not list -> do nothing
        // -> sat is in the list -> remove!!!!


        //list.some会判断list中的每一个item element。sat是我们当前检查的卫星
        const found = list.some( item => item.satid === sat.satid);
        if(status && !found) {
            list =  [...list, sat]
        }

        if(!status && found) {
            list = list.filter(item => item.satid !== sat.satid)
        }

        console.log(list);
        return list;
    }





}

export default SatelliteList;
