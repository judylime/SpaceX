import React, {Component} from 'react';

import {Form, Button, InputNumber} from 'antd';

class SatSettingForm extends Component {

    render() {
        console.log("this.props ：");//这里是form (被Form.create创建的） && onshow function 来源于main.JS为了C->P通信传进来的
        console.log(this.props);/*this.props 就是这个form，这个form是由Form.create创建出来的，传给了内部的SatSettingForm 参数component*/
        console.log("this.props.form：");//这个form里有很多的function可以用
        console.log(this.props.form);
        const {getFieldDecorator} = this.props.form;//destructing form function
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 11 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 13 },
            },
        };
        return (
            /*{...formItemLayout}代表把它本身按照<Form>的参数进行解构de-struct*/
            <Form {...formItemLayout} className="sat-setting" onSubmit={this.showSatellite}>
                <Form.Item label="Longitude(degrees)">
                    {
                        /*getFieldDecorator是由Form.create所创建的，所以antd定义了getFieldDecorator该如何使用
                        --> 即：getFieldDecorator(name,option）。 高阶组件
                        rules是定义validation过程的*/
                        getFieldDecorator("longitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Longitude",
                                }
                            ],
                        })(<InputNumber min={-180} max={180}
                                        style={{width: "100%"}}
                                        placeholder="Please input Longitude"
                        />)
                    }
                </Form.Item>

                <Form.Item label="Latitude(degrees)">
                    {
                        getFieldDecorator("latitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Latitude",
                                }
                            ],
                        })(<InputNumber placeholder="Please input Latitude"
                                        min={-90} max={90}
                                        style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Elevation(meters)">
                    {
                        getFieldDecorator("elevation", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Elevation",
                                }
                            ],
                        })(<InputNumber placeholder="Please input Elevation"
                                        min={-413} max={8850}
                                        style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Altitude(degrees)">
                    {
                        getFieldDecorator("altitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Altitude",
                                }
                            ],
                        })(<InputNumber placeholder="Please input Altitude"
                                        min={0} max={90}
                                        style={{width: "100%"}}
                        /> )
                    }
                </Form.Item>

                <Form.Item label="Duration(secs)">
                    {
                        getFieldDecorator("duration", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Duration",
                                }
                            ],
                        })(<InputNumber placeholder="Please input Duration" min={0} max={90} style={{width: "100%"}} />)
                    }
                </Form.Item>
                <Form.Item className="show-nearby">
                    <Button type="primary" htmlType="submit" style={{textAlign: "center"}}>
                        Find Nearby Satellite
                    </Button>
                </Form.Item>
            </Form>
        );
    }

    /*实现真正的前端用户点击on submit 拿到数据的功能*/
    showSatellite = e => {
        e.preventDefault();/*默认行为是自动向后端发送url的链接带一个'？' */
        /*子组件到父组件，实现数据通信*/
        this.props.form.validateFields((err, values) => {
            if (!err) {
                 console.log('Received values of form: ', values);
                this.props.onShow(values);//这里的values包含所有的前端用户关于satsetting的输入
                                            //这里是C->P 通信的：子组件invoke函数来改变数据
            }
        });
        // console.log("SatSettingForm");
        // console.log(SatSettingForm);
    }
}
//通过antd的Form库创建表格。SatSettingForm是个前端的component，前端长相。 create属于是高阶组件
//"Form.create({name: 'satellite-setting'})"是高阶函数，"(SatSettingForm)"是高阶函数传的参数
const SatSetting1 = Form.create({name: 'satellite-setting'})(SatSettingForm)

export default SatSetting1;
