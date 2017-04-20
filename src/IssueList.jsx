import React from 'react';
import 'whatwg-fetch';
import { Link } from 'react-router';
import { Button, Glyphicon, Table, Panel } from 'react-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import Toast from './Toast.jsx';

class IssueRow extends React.Component{
	constructor(){
		super();
		this.onDeleteClick = this.onDeleteClick.bind(this);
	}
	onDeleteClick() {
    	this.props.deleteIssue(this.props.issue._id);
  	}

	render(){
		const issue = this.props.issue;
		return(
			<tr>
				<td><Link to={`/issues/${issue._id}`}>{issue._id.substr(-4)}</Link></td>
		        <td>{issue.status}</td>
		        <td>{issue.owner}</td>
				<td>{issue.created.toDateString()}</td>
		        <td>{issue.effort}</td>
		        <td>{issue.completionDate ? issue.completionDate.toDateString() : ''}</td>
		        <td>{issue.title}</td>
		        <td>
		        	<Button bsSize="xsmall" onClick={this.onDeleteClick}>
		        		<Glyphicon glyph="trash" />
		        	</Button>
		        </td>
			</tr>
		);
	}
}

IssueRow.propTypes = {
  issue: React.PropTypes.object.isRequired,
  deleteIssue: React.PropTypes.func.isRequired,
};

class IssueTable extends React.Component{
	render(){
		const borderedStyle = {border: "1px solid silver", padding: 6};
		const issueRows = this.props.issues.map(issue => <IssueRow key={issue._id} issue={issue} deleteIssue={this.props.deleteIssue}/>);
		return(
			<Table bordered condensed hover responsive>
				<thead>
					<tr>
			            <th>Id</th>
			            <th>Статус</th>
			            <th>Автор</th>
			            <th>Создана</th>
			            <th>Попытка</th>
			            <th>Дата завершения</th>
			            <th>Название</th>
			            <th></th>
			         </tr>
				</thead>
				<tbody>
					{issueRows}
				</tbody>
			</Table>
		);
	}
}

IssueTable.propTypes = {
  issues: React.PropTypes.array.isRequired,
  deleteIssue: React.PropTypes.func.isRequired,
};


export default class IssueList extends React.Component{
	constructor(){
		super();
		this.state = { 
			issues: [],
			toastVisible: false, 
			toastMessage: '', 
			toastType: 'success', 
		};
		this.setFilter = this.setFilter.bind(this);
		this.deleteIssue = this.deleteIssue.bind(this);
		this.showError = this.showError.bind(this);
    	this.dismissToast = this.dismissToast.bind(this);
	}

	deleteIssue(id) {
	    fetch(`/api/issues/${id}`, { method: 'DELETE' }).then(response => {
	      if (!response.ok) alert('Failed to delete issue');
	      else this.loadData();
	    });
  	}

	setFilter(query){
		this.props.router.push({pathname: this.props.location.pathname, query})
	}

	componentDidMount() {
		this.loadData();
	}

	componentDidUpdate(prevProps) {
		const oldQuery = prevProps.location.query;
		const newQuery = this.props.location.query;
    	if (oldQuery.status === newQuery.status 
    		&& oldQuery.effort_gte === newQuery.effort_gte 
    		&& oldQuery.effort_lte === newQuery.effort_lte) {
      			return;
    	}
    	this.loadData();
	}

	loadData() {
		fetch(`/api/issues${this.props.location.search}`).then(response => {
			if(response.ok){
				response.json().then(data => {
				console.log("Total count of records:", data._metadata.total_count);
				data.records.forEach(issue => {
					issue.created = new Date(issue.created);
					if (issue.completionDate)
	        			issue.completionDate = new Date(issue.completionDate);
				});
				this.setState({ issues: data.records });
			});
			} else {
				response.json().then(error => {
			    	this.showError(`Не удалось получить задачи ${error.message}`);
			    });
			}
		})
		.catch(err => {
			this.showError(`Не удалось получить задачи с сервера: ${err}`);
		});
  	}

  	showError(message) {
   		this.setState({ toastVisible: true, toastMessage: message, toastType:'danger' });
	}
	 
	dismissToast() {
	   this.setState({ toastVisible: false });
	}

	render(){
		return(
			<div>
				<Panel collapsible header="Фильтр">
					<IssueFilter setFilter={this.setFilter} initFilter={this.props.location.query}/>
				</Panel>
		        <IssueTable issues={this.state.issues} deleteIssue={this.deleteIssue}/>
		        <hr />
		        <Toast
		          showing={this.state.toastVisible}
		          message={this.state.toastMessage}
		          onDismiss={this.dismissToast} 
		          bsStyle={this.state.toastType} />
			</div>
		);
	}
}

IssueList.propTypes = {
  location: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};