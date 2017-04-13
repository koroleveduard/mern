import React from 'react';
import 'whatwg-fetch';
import IssueAdd from './IssueAdd.jsx';
import IssueFilter from './IssueFilter.jsx';

class IssueRow extends React.Component{
	render(){
		const issue = this.props.issue;
		return(
			<tr>
				<td>{issue._id}</td>
		        <td>{issue.status}</td>
		        <td>{issue.owner}</td>
				<td>{issue.created.toDateString()}</td>
		        <td>{issue.effort}</td>
		        <td>{issue.completionDate ? issue.completionDate.toDateString() : ''}</td>
		        <td>{issue.title}</td>
			</tr>
		);
	}
}

IssueRow.defaultProps = {
	issue_title: '--no-title--'
}

class IssueTable extends React.Component{
	render(){
		const borderedStyle = {border: "1px solid silver", padding: 6};
		const issueRows = this.props.issues.map(issue => <IssueRow key={issue._id} issue={issue}/>);
		return(
			<table style={{borderCollapse: "collapse"}}>
				<thead>
					<tr>
			            <th>Id</th>
			            <th>Status</th>
			            <th>Owner</th>
			            <th>Created</th>
			            <th>Effort</th>
			            <th>Completion Date</th>
			            <th>Title</th>
			         </tr>
				</thead>
				<tbody>
					{issueRows}
				</tbody>
			</table>
		);
	}
}


export default class IssueList extends React.Component{
	constructor(){
		super();
		this.state = { issues: [] };
		this.createIssue = this.createIssue.bind(this);
	}

	createIssue(newIssue){
		fetch('/api/issues',{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(newIssue)
		})
		.then(response => {
			if(response.ok) {
				response.json().then(updatedIssue => {
					updatedIssue.created = new Date(updatedIssue.created);
				    if (updatedIssue.completionDate)
				    	updatedIssue.completionDate = new Date(updatedIssue.completionDate);
				    const newIssues = this.state.issues.concat(updatedIssue);
				    this.setState({ issues: newIssues });
				});
			} else {
				response.json().then(error => {
			    	alert("Failed to add issue: " + error.message)
			    });
			}
		})
		.catch(err => {
			alert("Error in sending data to server: " + err.message);
		});
	}

	componentDidMount() {
		this.loadData();
	}

	loadData() {
		fetch('/api/issues').then(response => {
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
			    	alert("Failed to fetch issues:" + error.message)
			    });
			}
		})
		.catch(err => {
			alert("Error in fetching data from server:", err);
		});
  	}

	render(){
		return(
			<div>
				<h1>Issue Tracker</h1>
				<IssueFilter/>
				<hr />
		        <IssueTable issues={this.state.issues}/>
		        <hr />
		        <IssueAdd createIssue={this.createIssue}/>	
			</div>
		);
	}
}