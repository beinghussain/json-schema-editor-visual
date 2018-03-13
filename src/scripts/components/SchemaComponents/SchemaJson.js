import React from 'react';
import { Input, Row, Col, Form, Select, Checkbox, Button, Icon, Modal } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import './schemaJson.css';
import _ from 'underscore';
import { connect } from 'react-redux';
import Model from '../../model.js';
import PropTypes from 'prop-types';
import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE } from '../../utils.js';


const mapping = (name, data) => {
  switch (data.type) {
    case 'array':
      return <SchemaArray prefix={name} data={data} />;
      break;
    case 'object':
      let nameArray = [].concat(name, 'properties')
      return <SchemaObject prefix={nameArray} data={data} />;
      break;
    default:
      return <AdvModal name={name} data={data} />;
    // return <SchemaOther dataSource={data}/>
  }
};

class AdvModal extends React.Component {
  constructor(props) {
    super(props);
  }

  state = { visible: false };
  showModal = () => {
    this.setState({
      visible: true
    });
  };
  handleOk = e => {
    this.setState({
      visible: false
    });
  };
  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  mapping = (name, data, changeHandler) => {
    return {
      string: <SchemaString onChange={changeHandler} data={data} />,
      number: <SchemaNumber onChange={changeHandler} data={data} />,
      boolean: <SchemaBoolean onChange={changeHandler} data={data} />,
      integer: <SchemaInt onChange={changeHandler} data={data} />
    }[data.type];
  };

  render() {
    const { data, name } = this.props;
    return (
      <div>
        <Button onClick={this.showModal}>高级</Button>
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          {this.mapping(name, data)}
        </Modal>
      </div>
    );
  }
}

const SchemaString = props => {
  return <div>String</div>;
};

const SchemaInt = props => {
  return <div>SchemaInt</div>;
};

const SchemaArray = (props, context) => {
  const { data, prefix } = props;
  let prefixArray = [].concat(prefix, 'items')
  const optionForm = mapping(prefixArray, data.items);

  return (
    !_.isUndefined(data.items) && (
      <div style={{ marginTop: '60px' }}>
        <div className="array-item-type">
          Items Type:
          <Select
            name="itemtype"
            onChange={e =>
              changeType(
                prefixArray,
                `type`,
                e,
                context.changeTypeAction
              )
            }
            value={data.items.type}
          >
            {SCHEMA_TYPE.map((item, index) => {
              return (
                <Option value={item} key={index}>
                  {item}
                </Option>
              );
            })}
          </Select>
        </div>
        <div className="option-formStyle">{optionForm}</div>
      </div>
    )
  );
};

SchemaArray.contextTypes = {
  changeTypeAction: PropTypes.func
};

const SchemaNumber = props => {
  return <div>SchemaNumber</div>;
};

const SchemaBoolean = props => {
  return <div>SchemaBoolean</div>;
};

const changeType = (prefix ,type , value, change) => {
  let key = [].concat(prefix, type)
  change(key, value);
};

const changeValue = (prefix ,type, value, change) => {
  let key = [].concat(prefix, type)
  change(key, value);
};
const changeName = (value, prefix, name, change) => {
  change(value, prefix, name);
};

const enableRequire = (prefix, name, required, change) => {
  change(prefix, name, required);
};

const deleteItem = (prefix, name, change) => {
  change.deleteItemAction(`${prefix}${JSONPATH_JOIN_CHAR}${name}`);
  change.enableRequireAction(prefix, name, false);
};

const add = (key, change) => {
  change(key);
};

const SchemaObject = (props, context) => {
  const { data, prefix } = props;
  console.log('prefix', prefix);
  return (
    <div className="object-style">
      {Object.keys(data.properties).map((name, index) => {
        let value = data.properties[name];
        let copiedState = value;
        let prefixArray = [].concat(prefix, name);
        let optionForm = mapping(prefixArray, copiedState);
        return (
          <Row data-index={index} key={index}>
            <Col span={4} className="col-item">
              <Input
                onChange={e => changeName(e.target.value, prefix, name, context.changeNameAction)}
                value={name}
              />
            </Col>
            <Col span={2} className="col-item">
              <Select
                className="type-select-style"
                onChange={e => changeType(prefixArray, 'type', e, context.changeTypeAction)}
                value={value.type}
              >
                {SCHEMA_TYPE.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Col>
            <Col span={2} className="col-item">
              <span className="required-icon">*</span>
              <Checkbox
                onChange={e =>
                  enableRequire(prefix, name, e.target.checked, context.enableRequireAction)
                }
                checked={_.isUndefined(data.required) ? false : data.required.indexOf(name) != -1}
              >
                必要
              </Checkbox>
            </Col>
            <Col span={4} className="col-item">
              <Input
                placeholder="默认值"
                value={value.default}
                onChange={e =>
                  changeValue(
                    prefixArray,
                    `default`,
                    e.target.value,
                    context.changeValueAction
                  )
                }
              />
            </Col>
            <Col span={4} className="col-item">
              <TextArea
                placeholder="备注"
                value={value.description}
                onChange={e =>
                  changeValue(
                    prefixArray,
                    `description`,
                    e.target.value,
                    context.changeValueAction
                  )
                }
              />
            </Col>
            <Col span={1} className="col-item">
              <span onClick={() => deleteItem(prefix, name, context)}>
                <Icon type="delete" />
              </span>
            </Col>
            <div className="option-formStyle">{optionForm}</div>
          </Row>
        );
      })}
      <Button onClick={() => add(prefix, context.addValueAction)} className="add-btn">
        再添加一项
      </Button>
    </div>
  );
};

SchemaObject.contextTypes = {
  changeNameAction: PropTypes.func,
  changeValueAction: PropTypes.func,
  enableRequireAction: PropTypes.func,
  addValueAction: PropTypes.func,
  deleteItemAction: PropTypes.func,
  changeTypeAction: PropTypes.func
};

const SchemaJson = props => {
  console.log(props.type);

  switch (props.type) {
    case 'object':
      return <SchemaObject prefix={['properties']} data={props.data} />;
    case 'array':
      return <SchemaArray prefix={[]} data={props.data} />;
    default:
      return null;
  }
};

export default SchemaJson;
