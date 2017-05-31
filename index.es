import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'
import {join} from 'path'
import {Button,FormGroup,ControlLabel,FormControl,Row,Col} from 'react-bootstrap'


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
        var n2q = data.n2q;
        var text="";
        for(var p in n2q){
          text = text + p + "\t" + n2q[p] + "\r\n";
        }
        data.textvalue=text;
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
          comment = comment + name + '想与您进行交易：'+n2q[name]+'\t\r\n';
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
        n2q[name]=comment;
      }else{
        va = text.split('|');
        if(va.length==2){
          var name = va[0];
          var comment = va[1];
          n2q[name]=comment;
        }
      }
    }
    this.setState({n2q:n2q},()=>{
      this.savelist();
    });
  };

  handleTextareaChange = e => {
    e.preventDefault();
    e.stopPropagation();
    var value = e.currentTarget.value;
    this.setState({textvalue:value});
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

    return (
      <div>
        <Row>
          <Col xs={1}></Col>
          <Col xs={10}>
            <FormGroup controlId="formControlsTextarea">
              <FormControl onChange={this.handleTextareaChange}
                           componentClass="textarea"
                           value={this.state.textvalue}
                           placeholder="输入格式：提督名+(TAB或|)+备注,每行一名提督"
                           style={{height: '200px'}}>

              </FormControl>
              <Button onClick={this.parseText}>提交</Button>
            </FormGroup>
          </Col>
          <Col xs={1}></Col>
        </Row>
        <Row>

        </Row>
      </div>
    )
  }
});




























