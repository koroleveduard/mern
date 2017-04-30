import React from 'react';
import 'isomorphic-fetch';
import { Link } from 'react-router';
import { Button, Glyphicon, Table, Panel,Pagination } from 'react-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import Toast from './Toast.jsx';

const PAGE_SIZE = 10;

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
	static dataFetcher({ urlBase, location }) {
	    const query = Object.assign({}, location.query);
    const pageStr = query._page;
    if (pageStr) {
      delete query._page;
      query._offset = (parseInt(pageStr, 10) - 1) * PAGE_SIZE;
    }
    query._limit = PAGE_SIZE;
    const search = Object.keys(query).map(k => `${k}=${query[k]}`).join('&');
    return fetch(`${urlBase || ''}/api/issues?${search}`).then(response => {
					if (!response.ok) return response.json().then(error => Promise.reject(error));
					return response.json().then(data => ({ IssueList: data }));
				});
	}

	constructor(props, context){
		super(props, context);
		const data = context.initialState.IssueList ? context.initialState.IssueList : { metadata: { totalCount: 0 }, records: [] };
    	const issues = data.records;
	    issues.forEach(issue => {
	      issue.created = new Date(issue.created);
	      if (issue.completionDate) {
	        issue.completionDate = new Date(issue.completionDate);
	      }
	    });
		this.state = { 
			issues,
			toastVisible: false, 
			toastMessage: '', 
			toastType: 'success',
			totalCount: data.metadata.totalCount,
		};
		this.setFilter = this.setFilter.bind(this);
		this.deleteIssue = this.deleteIssue.bind(this);
		this.showError = this.showError.bind(this);
    	this.dismissToast = this.dismissToast.bind(this);
    	this.selectPage = this.selectPage.bind(this);
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
    		&& oldQuery.effort_lte === newQuery.effort_lte
    		&& oldQuery._page === newQuery._page) {
      			return;
    	}
    	this.loadData();
	}

	selectPage(eventKey) {
    	const query = Object.assign(this.props.location.query, { _page: eventKey });
    	this.props.router.push({ pathname: this.props.location.pathname, query });
  }

	loadData() {
		IssueList.dataFetcher({ location: this.props.location })
		.then(data => {
			const issues = data.IssueList.records;
			issues.forEach(issue => {
				issue.created = new Date(issue.created);
				if (issue.completionDate) {
					issue.completionDate = new Date(issue.completionDate);
				}
			});

			this.setState({ issues, totalCount: data.IssueList.metadata.totalCount });
		}).catch(err => {
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
		        <Pagination
		          items={Math.ceil(this.state.totalCount / PAGE_SIZE)}
		          activePage={parseInt(this.props.location.query._page || '1', 10)}
		          onSelect={this.selectPage} maxButtons={7} next prev boundaryLinks
		        />
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

IssueList.contextTypes = {
  initialState: React.PropTypes.object,
};