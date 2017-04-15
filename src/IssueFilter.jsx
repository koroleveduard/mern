import React from 'react';
import { Link } from 'react-router';
import { Col, Row, FormGroup, FormControl, ControlLabel, InputGroup, ButtonToolbar, Button } from 'react-bootstrap';

export default class IssueFilter extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			tatus: props.initFilter.status || '',
		    effort_gte: props.initFilter.effort_gte || '',
		    effort_lte: props.initFilter.effort_lte || '',
		    changed: false,
		}
		this.onChangeStatus = this.onChangeStatus.bind(this);
	 	this.onChangeEffortGte = this.onChangeEffortGte.bind(this);
		this.onChangeEffortLte = this.onChangeEffortLte.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
		this.resetFilter = this.resetFilter.bind(this);
		this.clearFilter = this.clearFilter.bind(this);
	}

	componentWillReceiveProps(newProps) {
	  this.setState({
	    status: newProps.initFilter.status || '',
	    effort_gte: newProps.initFilter.effort_gte || '',
	    effort_lte: newProps.initFilter.effort_lte || '',
	    changed: false,
	  });
	}

	resetFilter() {
	  this.setState({
	    status: this.props.initFilter.status || '',
	    effort_gte: this.props.initFilter.effort_gte || '',
	    effort_lte: this.props.initFilter.effort_lte || '',
	    changed: false,
	  });
	}

	onChangeStatus(e){
		this.setState({status:e.target.value, changed:true});
	}

	onChangeEffortGte(e){
		const effortString = e.target.value;
		if (effortString.match(/^\d*$/)) {
			this.setState({ effort_gte: e.target.value, changed: true });
		}
	}

	onChangeEffortLte(e) {
	  const effortString = e.target.value;
	  if (effortString.match(/^\d*$/)) {
	    this.setState({ effort_lte: e.target.value, changed: true });
	  }
	}

	applyFilter() {
	  const newFilter = {};
	  if (this.state.status) newFilter.status = this.state.status;
	  if (this.state.effort_gte) newFilter.effort_gte = this.state.effort_gte;
	  if (this.state.effort_lte) newFilter.effort_lte = this.state.effort_lte;
	  this.props.setFilter(newFilter);
	}

	clearFilter() {
	  this.props.setFilter({});
	}

	render(){
		return(
		<Row>
			<Col xs={6} sm={4} md={4} lg={3}>
				<FormGroup>
					<ControlLabel>Статус</ControlLabel>
						<FormControl
						componentClass="select" value={this.state.status}
						onChange={this.onChangeStatus}
						>
						<option value="">(Любой)</option>
				        <option value="New">Новые</option>
				        <option value="Open">Открытые</option>
				        <option value="Assigned">Назначеные</option>
				        <option value="Fixed">Решенные</option>
				        <option value="Verified">Проверенные</option>
				        <option value="Closed">Закрытые</option>
						</FormControl>
				</FormGroup>
			</Col>
			<Col xs={6} sm={4} md={4} lg={3}>
			<FormGroup>
				<ControlLabel>Попытки</ControlLabel>
				<InputGroup>
				<FormControl value={this.state.effort_gte} onChange={this.onChangeEffortGte} />
				<InputGroup.Addon>-</InputGroup.Addon>
				<FormControl value={this.state.effort_lte} onChange={this.onChangeEffortLte} />
				</InputGroup>
			</FormGroup>
			</Col>
			<Col xs={6} sm={4} md={4} lg={3}>
			<FormGroup>
			<ControlLabel>&nbsp;</ControlLabel>
			<ButtonToolbar>
			<Button bsStyle="primary" onClick={this.applyFilter}>Применить</Button>
			<Button onClick={this.resetFilter} disabled={!this.state.changed}>Сбросить</Button>
			<Button onClick={this.clearFilter}>Очистить</Button>
			</ButtonToolbar>
			</FormGroup>
			</Col>
		</Row>
		);
	}
}

IssueFilter.propTypes = {
  setFilter: React.PropTypes.func.isRequired,
  initFilter: React.PropTypes.object.isRequired,
};