import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'
import {join} from 'path'
import {Button,FormGroup,ControlLabel,FormControl,Row,Col,OverlayTrigger,Tooltip} from 'react-bootstrap'


import {extensionSelectorFactory} from 'views/utils/selectors'
const fs = require('fs');

export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal'
  }),
  null, null, {pure: false}
)(class PluginEscort extends Component {
  constructor(props) {
    super(props)
    this.state = {
      need_load:true,
      textvalue:"",
      n2q:{}
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  savelist(){
    try {
      let data = this.state;
      console.log(111111);
      console.log(data);
      let savepath = join(window.APPDATA_PATH, 'escort', 'escort.json');
      fs.writeFileSync(savepath, JSON.stringify(data));
    } catch (e) {
      fs.mkdir(join(window.APPDATA_PATH, 'escort'));
      try {
        let data = this.loadlist();
        let savepath = join(window.APPDATA_PATH, 'escort', 'escort.json');
        fs.writeFileSync(savepath, JSON.stringify(data));
      } catch (e2) {
        console.log(e2);
      }
    }
  }

  loadlist() {
    let needload = this.state.need_load;
    if (needload) {
      try {
        let savedpath = join(window.APPDATA_PATH, 'escort', 'escort.json');
        let datastr = fs.readFileSync(savedpath, 'utf-8');
        let data = eval("(" + datastr + ")");
        data.need_load = false;
        data.textvalue="";
        this.setState(data,() => {

        });
        return data;
      } catch (e) {
        fs.mkdir(join(window.APPDATA_PATH, 'escort'));
        return {};
      }
    } else {
      return this.state;
    }
  }



  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse);
    this.loadlist();
  };

  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  };

  handleResponse = e => {
    const {path, body} = e.detail;
    if(path=='/kcsapi/api_get_member/practice'){
      var n2q = this.state.n2q;
      var comment = '';
      var list = body.api_list;
      for(var i=0;i<list.length;i++){
        var name = list[i].api_enemy_name;
        if(n2q[name]){
          comment = comment + name + '想与您进行交易,备注信息：'+n2q[name]+'\t\r\n';
        }
      }
      if(comment!=''){
        window.toast(<div>{comment}</div>,{title:"群交易提醒"});
      }
    }
  };

  parseText = e => {
    var alltext = this.state.textvalue;
    var ta = alltext.split("\n");
    var n2q = this.state.n2q;
    for(var i=0;i<ta.length;i++){
      var text = ta[i];
      var va = text.split('\t');
      if(va.length==2){
        var name = va[0];
        var comment = va[1];
        if(name!=""){
          n2q[name]=comment;
        }

      }else{
        va = text.split('|');
        if(va.length==2){
          var name = va[0];
          var comment = va[1];
          if(name!=""){
            n2q[name]=comment;
          }
        }
      }
    }
    this.setState({n2q:n2q,textvalue:""},()=>{
      this.savelist();
    });
  };

  handleTextareaChange = e => {
    e.preventDefault();
    e.stopPropagation();
    var value = e.currentTarget.value;
    this.setState({textvalue:value});
  }

  removeescort(value){
    console.log(value);
    var n2q = this.state.n2q;
    delete(n2q[value]);
    this.setState({n2q:n2q},()=>{
      this.savelist();
    });
  }



  render() {
    try {
      return this.render_D();
    } catch (e) {
      console.log(e);
      return (
        <div>
          unknown error
        </div>
      )
    }
  }

  render_D() {
    const {horizontal} = this.props;
    const colSm = (horizontal == 'horizontal') ? 4 : 3,
      colMd = (horizontal == 'horizontal') ? 4 : 2;
    var users = Object.keys(this.state.n2q);
    return (
      <div id="escort" className="escort">
        <link rel="stylesheet" href={join(__dirname, 'escort.css')}/>
        <Row>
          <Col xs={10}>
            <FormGroup controlId="formControlsTextarea">
              <FormControl onChange={this.handleTextareaChange}
                           componentClass="textarea"
                           value={this.state.textvalue}
                           placeholder="在此输入提督名列表，点提交后生效。输入格式：提督名+(TAB或|)+备注,每行一名提督,输入完成后点提交才能生效"
                           style={{height: '200px'}}>

              </FormControl>
              <Button onClick={this.parseText}>提交</Button>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          {
            users.map((e) => {
              return(
                <Col xs={4} sm={colSm} md={colMd}>
                  <div className="ship-item btn-default" >
                    <OverlayTrigger placement="top" overlay={
                      <Tooltip>
                        <div>备注信息： {this.state.n2q[e]}</div>
                      </Tooltip>
                    }>
                      <span className="ship-name">
                        {e}
                      </span>
                    </OverlayTrigger>
                    <span value ={e} onClick={() => {this.removeescort(e)}} className="close-btn"> </span>
                  </div>
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }
});




























