import React,{Component} from "react";
import PageUtil from "../../../core/helpers/page-util";
import { getAppInsights } from "../../../core/settings/app-insights";

class CustomPageAppInsights extends Component{
    _azureInsights=getAppInsights();
    constructor(props){
super(props);
this.state={
    
}
    }
    async componentDidMount(){
        await this.loadPageViewData();
    }

    loadPageViewData=async()=>{
        let pageTitle=PageUtil.getHeadTitle(this.props.title);
        await this._azureInsights.trackPageView({name:pageTitle});

    }
    render(){
return<></>
    }
}

export default CustomPageAppInsights;

